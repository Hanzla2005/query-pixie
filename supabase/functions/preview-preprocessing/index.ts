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
  return numericCount / nonEmptyValues.length > 0.8;
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

// Helper: Calculate mode
function calculateMode(values: string[]): string {
  if (values.length === 0) return 'Unknown';
  const frequency: Record<string, number> = {};
  values.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  return Object.entries(frequency).reduce((a, b) => a[1] > b[1] ? a : b)[0];
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

    console.log("Generating preprocessing preview for dataset:", datasetId);

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
    const lines = fileContent.split("\n").filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error("File is empty");
    }

    const headers = lines[0].split(",").map(col => col.trim().replace(/^"|"$/g, ""));
    const originalRowCount = lines.length - 1;

    // Parse all rows
    const rawRows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, ""));
      rawRows.push(cells);
    }

    // Get original sample (first 10 rows)
    const originalSample = rawRows.slice(0, 10);

    // Detect column types and calculate imputation values
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
        
        columnStats[colIdx] = {
          type: 'numeric',
          mean,
          median,
          imputeValue: median,
          missingCount: columnValues.length - nonMissingValues.length,
          totalCount: columnValues.length,
        };
      } else {
        const mode = calculateMode(nonMissingValues);
        columnStats[colIdx] = {
          type: 'categorical',
          mode,
          imputeValue: mode,
          missingCount: columnValues.length - nonMissingValues.length,
          totalCount: columnValues.length,
          uniqueValues: new Set(nonMissingValues).size,
        };
      }
    }

    // Process data
    const processedRows: string[][] = [];
    const seenRows = new Set<string>();
    let removedEmptyRows = 0;
    let duplicatesRemoved = 0;
    let imputedCells = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      
      // Skip completely empty rows
      if (row.every(cell => !cell || cell.trim() === '')) {
        removedEmptyRows++;
        continue;
      }

      // Process each cell
      const processedRow = row.map((cell, colIdx) => {
        const normalized = cell.toLowerCase().trim();
        const isMissing = !cell || normalized === 'null' || normalized === 'na' || 
                         normalized === 'n/a' || normalized === 'nan' || cell.trim() === '';
        
        if (isMissing && columnStats[colIdx]) {
          imputedCells++;
          return String(columnStats[colIdx].imputeValue);
        }
        
        return cell.trim();
      });

      // Check for duplicates
      const rowKey = processedRow.join('|');
      if (seenRows.has(rowKey)) {
        duplicatesRemoved++;
        continue;
      }
      seenRows.add(rowKey);

      processedRows.push(processedRow);
    }

    // Get processed sample (first 10 rows)
    const processedSample = processedRows.slice(0, 10);

    // Build column-level changes
    const columnChanges = headers.map((header, idx) => {
      const stats = columnStats[idx];
      return {
        name: header,
        type: stats?.type || 'unknown',
        missingBefore: stats?.missingCount || 0,
        missingAfter: 0, // After imputation
        missingPercentage: stats ? ((stats.missingCount / stats.totalCount) * 100).toFixed(1) : '0',
        imputationStrategy: stats?.type === 'numeric' ? 'Median' : 'Mode',
        imputationValue: stats?.imputeValue,
      };
    });

    const preview = {
      original: {
        rowCount: originalRowCount,
        sample: originalSample,
        headers,
      },
      processed: {
        rowCount: processedRows.length,
        sample: processedSample,
        headers,
      },
      changes: {
        emptyRowsRemoved: removedEmptyRows,
        duplicatesRemoved,
        cellsImputed: imputedCells,
        rowsRetained: processedRows.length,
        rowsRemovedTotal: originalRowCount - processedRows.length,
      },
      columnChanges,
      steps: [
        "Detect column types (numeric vs categorical)",
        `Impute ${imputedCells} missing values using median (numeric) or mode (categorical)`,
        `Remove ${duplicatesRemoved} duplicate rows`,
        `Remove ${removedEmptyRows} completely empty rows`,
        "Apply data type-specific cleaning strategies"
      ]
    };

    console.log("Preview generated successfully");

    return new Response(
      JSON.stringify(preview),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Preview generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
