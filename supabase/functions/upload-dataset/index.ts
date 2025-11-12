import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    console.log("Upload dataset function called");
    console.log("Request method:", req.method);
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    console.log("User authenticated:", !!user);
    
    if (userError || !user) {
      console.error("User authentication failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsing request body...");
    const { fileName, fileData, fileType } = await req.json();
    console.log("File name:", fileName, "File type:", fileType);
    
    if (!fileName || !fileData) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileExt = fileName.split(".").pop()?.toLowerCase();
    
    if (!["csv", "xlsx"].includes(fileExt || "")) {
      return new Response(
        JSON.stringify({ error: "Only CSV and XLSX files are supported" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert base64 to blob
    const binaryString = atob(fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: fileType || 'application/octet-stream' });

    // Upload file to storage
    const filePath = `${user.id}/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabaseClient.storage
      .from("datasets")
      .upload(filePath, blob, { contentType: fileType });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Parse file to get metadata
    const textDecoder = new TextDecoder();
    const fileContent = textDecoder.decode(bytes);
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
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
