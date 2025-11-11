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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("No file provided");
    }

    const fileName = file.name;
    const fileExt = fileName.split(".").pop()?.toLowerCase();
    
    if (!["csv", "xlsx"].includes(fileExt || "")) {
      throw new Error("Only CSV and XLSX files are supported");
    }

    // Upload file to storage
    const filePath = `${user.id}/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabaseClient.storage
      .from("datasets")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Parse file to get metadata
    const fileContent = await file.text();
    let columns: string[] = [];
    let rowCount = 0;

    if (fileExt === "csv") {
      const lines = fileContent.split("\n").filter(line => line.trim());
      if (lines.length > 0) {
        columns = lines[0].split(",").map(col => col.trim().replace(/^"|"$/g, ""));
        rowCount = lines.length - 1; // Exclude header
      }
    } else if (fileExt === "xlsx") {
      // For XLSX, we'll store basic metadata
      // More advanced parsing would require additional libraries
      columns = ["Column parsing requires client-side library"];
      rowCount = 0;
    }

    // Create dataset record
    const { data: dataset, error: insertError } = await supabaseClient
      .from("datasets")
      .insert({
        name: fileName,
        file_path: filePath,
        user_id: user.id,
        columns: columns,
        row_count: rowCount,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      // Clean up uploaded file
      await supabaseClient.storage.from("datasets").remove([filePath]);
      throw new Error(`Failed to create dataset record: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        dataset,
        message: "Dataset uploaded successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upload dataset error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
