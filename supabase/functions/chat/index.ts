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
    const { messages, datasetId } = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace('Bearer ', '');

    // Create client with service role for all operations
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

    // Get dataset context if datasetId is provided
    let systemPrompt = "You are DataMind, an AI assistant specialized in data analysis and insights. You help users understand their datasets, create visualizations, and discover patterns in their data. Keep your responses clear, concise, and actionable.\n\nWhen users ask for trends, relationships, or multi-dimensional analysis, use 3D visualizations to show how variables interact. 3D charts are perfect for exploring correlations between three numeric variables.";
    let datasetContext: any = null;
    let sampleData: any[] = [];
    
    if (datasetId) {
      const { data: dataset } = await supabaseClient
        .from("datasets")
        .select("*")
        .eq("id", datasetId)
        .single();

      if (dataset) {
        datasetContext = dataset;
        
        // Fetch sample data from storage for visualization
        try {
          const { data: fileData } = await supabaseClient.storage
            .from("datasets")
            .download(dataset.file_path);
          
          if (fileData) {
            const text = await fileData.text();
            const rows = text.split('\n').filter((r: string) => r.trim()).slice(0, 101); // Header + 100 rows
            
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
            
            const headers = parseCSVRow(rows[0]);
            sampleData = rows.slice(1).map((row: string) => {
              const values = parseCSVRow(row);
              const obj: any = {};
              headers.forEach((header: string, i: number) => {
                obj[header] = values[i] || '';
              });
              return obj;
            });
          }
        } catch (e) {
          console.error("Error loading sample data:", e);
        }
        
        let preprocessingInfo = "";
        if (dataset.preprocessing_status === 'completed' && dataset.preprocessing_metadata) {
          const meta = dataset.preprocessing_metadata;
          preprocessingInfo = `\n\nData Preprocessing Applied:\n${meta.steps?.map((s: string) => `- ${s}`).join('\n') || ''}\nData cleaned: ${dataset.original_row_count || 0} rows → ${dataset.row_count || 0} rows\n- Removed ${meta.removedRows || 0} empty rows\n- Removed ${meta.duplicatesRemoved || 0} duplicate rows\n- Cleaned ${meta.cleanedCells || 0} cells with missing values`;
        } else if (dataset.preprocessing_status === 'pending') {
          preprocessingInfo = '\n\nNote: Dataset is currently being preprocessed. Data shown may not be fully cleaned yet.';
        }
        
        systemPrompt += `\n\nYou are currently analyzing a dataset named "${dataset.name}" with ${dataset.row_count} rows and the following columns: ${JSON.stringify(dataset.columns)}.${preprocessingInfo}\n\nYou have access to sample data (100 rows) for creating visualizations. When creating 3D charts, use the actual sample data from the dataset.\n\nSample data preview:\n${JSON.stringify(sampleData.slice(0, 5), null, 2)}`;
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
          ...messages,
        ],
        stream: true,
        tools: [
          {
            type: "function",
            function: {
              name: "create_chart",
              description: "Create a 2D chart or graph visualization from data. Use this for bar charts, line charts, pie charts, and area charts.",
              parameters: {
                type: "object",
                properties: {
                  chartType: {
                    type: "string",
                    enum: ["bar", "line", "pie", "area"],
                    description: "The type of chart to create"
                  },
                  title: {
                    type: "string",
                    description: "Title of the chart"
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "number" }
                      }
                    },
                    description: "Array of data points with name and value"
                  },
                  xAxisLabel: {
                    type: "string",
                    description: "Label for X axis (optional)"
                  },
                  yAxisLabel: {
                    type: "string",
                    description: "Label for Y axis (optional)"
                  }
                },
                required: ["chartType", "title", "data"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "create_3d_chart",
              description: "Create an interactive 3D visualization to show relationships between three numeric variables. Perfect for exploring correlations, trends, and multi-dimensional patterns. Use when users ask for 3D graphs, multi-variable analysis, or spatial relationships.",
              parameters: {
                type: "object",
                properties: {
                  xColumn: {
                    type: "string",
                    description: "Name of the column for X axis (must be numeric)"
                  },
                  yColumn: {
                    type: "string",
                    description: "Name of the column for Y axis (must be numeric)"
                  },
                  zColumn: {
                    type: "string",
                    description: "Name of the column for Z axis (must be numeric)"
                  },
                  title: {
                    type: "string",
                    description: "Title of the 3D chart"
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object"
                    },
                    description: "Array of data objects containing all column values"
                  },
                  type: {
                    type: "string",
                    enum: ["3d-scatter", "3d-surface"],
                    description: "Type of 3D visualization (default: 3d-scatter)"
                  },
                  colorColumn: {
                    type: "string",
                    description: "Optional column name to use for color coding points"
                  }
                },
                required: ["xColumn", "yColumn", "zColumn", "title", "data"]
              }
            }
          }
        ],
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
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store user message
    await supabaseClient.from("chat_messages").insert({
      user_id: user.id,
      dataset_id: datasetId,
      content: messages[messages.length - 1].content,
      role: "user",
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
