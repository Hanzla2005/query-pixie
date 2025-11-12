import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    console.log("Starting preprocessing for dataset:", datasetId);

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

    // Preprocessing steps
    const preprocessingMetadata: Record<string, any> = {
      steps: [],
      removedRows: 0,
      cleanedCells: 0,
      duplicatesRemoved: 0,
    };

    const processedRows: string[][] = [];
    const seenRows = new Set<string>();

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, ""));
      
      // Skip rows with all empty cells
      if (cells.every(cell => !cell)) {
        preprocessingMetadata.removedRows++;
        continue;
      }

      // Clean cells: remove extra whitespace, handle missing values
      const cleanedCells = cells.map((cell, idx) => {
        if (!cell || cell.toLowerCase() === 'null' || cell.toLowerCase() === 'na' || cell.toLowerCase() === 'n/a') {
          preprocessingMetadata.cleanedCells++;
          return ''; // Replace missing values with empty string
        }
        return cell.trim();
      });

      // Check for duplicates
      const rowKey = cleanedCells.join('|');
      if (seenRows.has(rowKey)) {
        preprocessingMetadata.duplicatesRemoved++;
        continue;
      }
      seenRows.add(rowKey);

      processedRows.push(cleanedCells);
    }

    preprocessingMetadata.steps = [
      "Removed empty rows",
      "Cleaned missing values (null, NA, N/A)",
      "Removed duplicate rows",
      "Trimmed whitespace from all cells"
    ];

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

    console.log("Preprocessing completed successfully");

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
