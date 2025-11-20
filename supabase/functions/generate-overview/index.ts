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
    const { datasetId } = await req.json();
    console.log("Generating overview for dataset:", datasetId);
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the user's JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error("Auth error:", userError);
      throw new Error("Unauthorized");
    }

    // Fetch dataset info
    const { data: dataset, error: datasetError } = await supabaseClient
      .from("datasets")
      .select("*")
      .eq("id", datasetId)
      .eq("user_id", user.id)
      .single();

    if (datasetError || !dataset) {
      console.error("Dataset fetch error:", datasetError);
      throw new Error("Dataset not found");
    }

    // Fetch dataset data from storage
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from("datasets")
      .download(dataset.file_path);

    if (fileError || !fileData) {
      console.error("File download error:", fileError);
      throw new Error("Failed to download dataset file");
    }

    const text = await fileData.text();
    const rows = text.split('\n').filter(r => r.trim());
    
    // CSV parser function that handles quoted values
    const parseCSVRow = (row: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    };
    
    // Parse header row
    const headers = parseCSVRow(rows[0]);
    console.log("CSV Headers:", headers);
    
    // Parse data rows
    const sampleRows = rows.slice(1, 101).map(row => {
      const values = parseCSVRow(row);
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    });
    
    console.log("Sample row example:", sampleRows[0]);

    console.log(`Analyzing ${sampleRows.length} sample rows from dataset`);

    // Calculate distribution data for numeric-looking columns using CSV headers
    const distributions: any = {};
    const MAX_BINS = 10;

    headers.forEach((header) => {
      // Collect numeric candidates for this column from sample rows
      const rawValues = sampleRows
        .map((row) => row[header])
        .filter((v: any) => v !== undefined && v !== null && String(v).trim() !== "");

      const numericValues = rawValues
        .map((v: any) => parseFloat(String(v).replace(/[^0-9.+-eE]/g, "")))
        .filter((v: number) => !isNaN(v));

      const numericRatio = rawValues.length > 0 ? numericValues.length / rawValues.length : 0;
      console.log(`Column ${header}: ${numericValues.length} numeric of ${rawValues.length} values (ratio=${numericRatio})`);

      // Treat column as numeric if majority of non-empty values parse as numbers
      if (numericValues.length > 0 && numericRatio >= 0.6) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        if (min === max) {
          distributions[header] = [{ range: `${min.toFixed(2)}`, count: numericValues.length }];
          console.log(`Uniform distribution for ${header}:`, distributions[header]);
          return;
        }

        const bins = Math.min(MAX_BINS, numericValues.length);
        const binSize = (max - min) / bins;
        const distribution = Array(bins).fill(0);

        numericValues.forEach((v) => {
          const binIndex = Math.min(Math.floor((v - min) / binSize), bins - 1);
          distribution[binIndex]++;
        });

        distributions[header] = distribution.map((count, i) => ({
          range: `${(min + i * binSize).toFixed(2)}-${(min + (i + 1) * binSize).toFixed(2)}`,
          count,
        }));

        console.log(`Distribution for ${header}:`, distributions[header]);
      }
    });

    // Prepare prompt for AI
    const systemPrompt = `You are a data analysis expert. Analyze the provided dataset and generate comprehensive insights.

Return your response as a structured JSON object with this exact format:
{
  "summary": "Brief overview of the dataset and key findings",
  "numericInsights": [
    {
      "columnName": "name of numeric column",
      "mean": number,
      "median": number,
      "min": number,
      "max": number,
      "trend": "description of trend or pattern observed",
      "description": "detailed description of what this data shows and its significance"
    }
  ],
  "categoricalInsights": [
    {
      "columnName": "name of categorical column",
      "topValues": [{"name": "value", "count": number}],
      "uniqueCount": number,
      "description": "detailed description of the distribution and what it reveals"
    }
  ],
  "keyFindings": ["finding 1", "finding 2", "finding 3"]
}

Important: Do not include visualizationType fields. Focus on statistical analysis and insights.`;

    const userPrompt = `Analyze this dataset:
Dataset Name: ${dataset.name}
Total Rows: ${dataset.row_count}
Columns: ${JSON.stringify(dataset.columns)}

Sample Data (first 100 rows):
${JSON.stringify(sampleRows, null, 2)}

Provide comprehensive analysis with insights and visualization recommendations.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI for analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    console.log("AI analysis completed");

    let insights;
    try {
      const content = aiResponse.choices[0].message.content;
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      insights = JSON.parse(jsonStr);
      
      // Add distribution data to numeric insights
      insights.numericInsights = insights.numericInsights?.map((insight: any) => ({
        ...insight,
        distribution: distributions[insight.columnName] || []
      })) || [];
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse AI insights");
    }

    // Return the analysis
    return new Response(
      JSON.stringify({
        dataset: {
          id: dataset.id,
          name: dataset.name,
          row_count: dataset.row_count,
          columns: dataset.columns
        },
        insights,
        sampleData: sampleRows.slice(0, 10) // Include first 10 rows for reference
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Generate overview error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
