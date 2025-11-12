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

    // Create client for auth verification (with user token)
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

    // Create client with service role for database/storage operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { datasetId, page = 1, pageSize = 50 } = await req.json();

    if (!datasetId) {
      throw new Error("Dataset ID is required");
    }

    // Get dataset metadata
    const { data: dataset, error: datasetError } = await supabaseClient
      .from("datasets")
      .select("*")
      .eq("id", datasetId)
      .eq("user_id", user.id)
      .single();

    if (datasetError || !dataset) {
      throw new Error("Dataset not found or access denied");
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from("datasets")
      .download(dataset.file_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const fileContent = await fileData.text();
    const fileExt = dataset.name.split(".").pop()?.toLowerCase();

    let rows: string[][] = [];
    let headers: string[] = [];
    let totalRows = 0;
    let statistics: Record<string, { min: number; max: number; mean: number }> = {};

    if (fileExt === "csv") {
      const lines = fileContent.split("\n").filter(line => line.trim());
      if (lines.length > 0) {
        // Parse headers
        headers = lines[0].split(",").map(col => col.trim().replace(/^"|"$/g, ""));
        
        // Calculate pagination
        totalRows = lines.length - 1;
        const startIdx = (page - 1) * pageSize + 1; // +1 to skip header
        const endIdx = Math.min(startIdx + pageSize, lines.length);
        
        // Parse data rows for current page
        for (let i = startIdx; i < endIdx; i++) {
          const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, ""));
          rows.push(row);
        }

        // Calculate statistics for numeric columns (only on first page request)
        if (page === 1) {
          const columnData: Record<string, number[]> = {};
          
          // Initialize arrays for each column
          headers.forEach(header => {
            columnData[header] = [];
          });

          // Collect numeric values for each column
          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, ""));
            row.forEach((cell, idx) => {
              const value = parseFloat(cell);
              if (!isNaN(value) && headers[idx]) {
                columnData[headers[idx]].push(value);
              }
            });
          }

          // Calculate min, max, mean for numeric columns
          Object.keys(columnData).forEach(column => {
            const values = columnData[column];
            if (values.length > 0) {
              statistics[column] = {
                min: Math.min(...values),
                max: Math.max(...values),
                mean: values.reduce((a, b) => a + b, 0) / values.length
              };
            }
          });
        }
      }
    } else {
      throw new Error("XLSX preview not yet supported. Please convert to CSV.");
    }

    return new Response(
      JSON.stringify({
        headers,
        rows,
        totalRows,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalRows / pageSize),
        statistics: page === 1 ? statistics : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Get dataset error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
