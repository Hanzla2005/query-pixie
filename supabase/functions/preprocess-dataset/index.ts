import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: Detect if column is numeric
function isNumericColumn(values: string[]): boolean {
  const nonEmptyValues = values.filter(v => v && v.trim() !== '');
  if (nonEmptyValues.length === 0) return false;
  
  const numericCount = nonEmptyValues.filter(v => !isNaN(Number(v))).length;
  return numericCount / nonEmptyValues.length > 0.8; // 80% threshold
}

// Helper: Calculate mean
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Helper: Calculate median
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Helper: Calculate mode for categorical data
function calculateMode(values: string[]): string {
  if (values.length === 0) return 'Unknown';
  const frequency: Record<string, number> = {};
  values.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  return Object.entries(frequency).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

// Helper: Detect and handle outliers using IQR method
function detectOutliers(values: number[]): { isOutlier: boolean[], q1: number, q3: number, iqr: number } {
  if (values.length < 4) return { isOutlier: values.map(() => false), q1: 0, q3: 0, iqr: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const isOutlier = values.map(v => v < lowerBound || v > upperBound);
  return { isOutlier, q1, q3, iqr };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { datasetId } = await req.json();

    if (!datasetId) {
      throw new Error("Dataset ID is required");
    }

    console.log("Starting intelligent preprocessing for dataset:", datasetId);

    // Get dataset
    const { data: dataset, error: datasetError } = await supabaseClient
      .from("datasets")
      .select("*")
      .eq("id", datasetId)
      .eq("user_id", user.id)
      .single();

    if (datasetError || !dataset) {
      throw new Error("Dataset not found or access denied");
    }

    // Download file
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from("datasets")
      .download(dataset.file_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const fileContent = await fileData.text();
    const fileExt = dataset.name.split(".").pop()?.toLowerCase();

    if (fileExt !== "csv") {
      throw new Error("Only CSV files are supported for preprocessing");
    }

    const lines = fileContent.split("\n").filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error("File is empty");
    }

    const headers = lines[0].split(",").map(col => col.trim().replace(/^"|"$/g, ""));
    const originalRowCount = lines.length - 1;

    console.log(`Processing ${originalRowCount} rows with ${headers.length} columns`);

    // Step 1: Parse all rows
    const rawRows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, ""));
      rawRows.push(cells);
    }

    // Step 2: Detect column types and prepare imputation values
    const columnStats: Record<number, any> = {};
    
    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      const columnValues = rawRows.map(row => row[colIdx] || '');
      const nonMissingValues = columnValues.filter(v => {
        const normalized = v.toLowerCase();
        return v && normalized !== 'null' && normalized !== 'na' && normalized !== 'n/a' && normalized !== 'nan' && normalized !== '';
      });

      const isNumeric = isNumericColumn(nonMissingValues);
      
      if (isNumeric) {
        const numericValues = nonMissingValues.map(v => Number(v)).filter(v => !isNaN(v));
        const mean = calculateMean(numericValues);
        const median = calculateMedian(numericValues);
        const { isOutlier, q1, q3, iqr } = detectOutliers(numericValues);
        const outlierCount = isOutlier.filter(x => x).length;
        
        columnStats[colIdx] = {
          type: 'numeric',
          mean,
          median,
          imputeValue: median, // Use median for robustness against outliers
          missingCount: columnValues.length - nonMissingValues.length,
          outlierCount,
          q1,
          q3,
          iqr,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
        };
        
        console.log(`Column "${headers[colIdx]}": Numeric - Mean: ${mean.toFixed(2)}, Median: ${median.toFixed(2)}, Missing: ${columnStats[colIdx].missingCount}, Outliers: ${outlierCount}`);
      } else {
        const mode = calculateMode(nonMissingValues);
        columnStats[colIdx] = {
          type: 'categorical',
          mode,
          imputeValue: mode,
          missingCount: columnValues.length - nonMissingValues.length,
          uniqueValues: new Set(nonMissingValues).size,
        };
        
        console.log(`Column "${headers[colIdx]}": Categorical - Mode: ${mode}, Missing: ${columnStats[colIdx].missingCount}, Unique: ${columnStats[colIdx].uniqueValues}`);
      }
    }

    // Step 3: Apply preprocessing with intelligent imputation
    const preprocessingMetadata: Record<string, any> = {
      steps: [],
      removedRows: 0,
      imputedCells: 0,
      duplicatesRemoved: 0,
      outliersDetected: 0,
      columnStats: {},
    };

    const processedRows: string[][] = [];
    const seenRows = new Set<string>();

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      
      // Skip rows with ALL cells empty
      if (row.every(cell => !cell || cell.trim() === '')) {
        preprocessingMetadata.removedRows++;
        continue;
      }

      // Process each cell in the row
      const processedRow = row.map((cell, colIdx) => {
        const normalized = cell.toLowerCase().trim();
        const isMissing = !cell || normalized === 'null' || normalized === 'na' || 
                         normalized === 'n/a' || normalized === 'nan' || cell.trim() === '';
        
        if (isMissing && columnStats[colIdx]) {
          preprocessingMetadata.imputedCells++;
          // Impute with calculated value (mean/median for numeric, mode for categorical)
          return String(columnStats[colIdx].imputeValue);
        }
        
        return cell.trim();
      });

      // Check for duplicates
      const rowKey = processedRow.join('|');
      if (seenRows.has(rowKey)) {
        preprocessingMetadata.duplicatesRemoved++;
        continue;
      }
      seenRows.add(rowKey);

      processedRows.push(processedRow);
    }

    // Prepare column statistics for metadata
    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      const stats = columnStats[colIdx];
      if (stats) {
        preprocessingMetadata.columnStats[headers[colIdx]] = {
          type: stats.type,
          missingImputed: stats.missingCount,
          ...(stats.type === 'numeric' ? {
            mean: stats.mean,
            median: stats.median,
            min: stats.min,
            max: stats.max,
            outliers: stats.outlierCount,
          } : {
            mode: stats.mode,
            uniqueValues: stats.uniqueValues,
          })
        };
        
        if (stats.type === 'numeric' && stats.outlierCount > 0) {
          preprocessingMetadata.outliersDetected += stats.outlierCount;
        }
      }
    }

    preprocessingMetadata.steps = [
      "Detected column types (numeric vs categorical)",
      `Imputed ${preprocessingMetadata.imputedCells} missing values using median (numeric) or mode (categorical)`,
      `Detected ${preprocessingMetadata.outliersDetected} outliers (preserved in data)`,
      `Removed ${preprocessingMetadata.duplicatesRemoved} duplicate rows`,
      `Removed ${preprocessingMetadata.removedRows} completely empty rows`,
      "Applied data type-specific cleaning strategies"
    ];

    console.log(`Preprocessing summary: ${processedRows.length} rows retained from ${originalRowCount} original rows`);
    console.log(`Imputed ${preprocessingMetadata.imputedCells} missing values intelligently`);

    // Create processed CSV content
    const processedContent = [
      headers.join(","),
      ...processedRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Upload processed file
    const processedFilePath = dataset.file_path.replace(/(\.[^.]+)$/, '_processed$1');
    const { error: uploadError } = await supabaseClient.storage
      .from("datasets")
      .upload(processedFilePath, new Blob([processedContent], { type: 'text/csv' }), {
        contentType: 'text/csv',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload processed file: ${uploadError.message}`);
    }

    // Update dataset record
    const { error: updateError } = await supabaseClient
      .from("datasets")
      .update({
        file_path: processedFilePath,
        preprocessing_status: 'completed',
        preprocessing_metadata: preprocessingMetadata,
        original_row_count: originalRowCount,
        processed_row_count: processedRows.length,
        row_count: processedRows.length,
      })
      .eq("id", datasetId);

    if (updateError) {
      throw new Error(`Failed to update dataset: ${updateError.message}`);
    }

    console.log("Intelligent preprocessing completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        metadata: preprocessingMetadata,
        originalRowCount,
        processedRowCount: processedRows.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Preprocessing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
