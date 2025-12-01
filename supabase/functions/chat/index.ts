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
    let systemPrompt = `You are DataMind, an AI assistant specialized in data analysis and insights. You help users understand their datasets, create visualizations, and discover patterns in their data. Keep your responses clear, concise, and actionable.

CRITICAL: When creating visualizations, you MUST format data correctly for each chart type:

**BAR CHART** - Compare categories
Data format: [{ name: "Category A", value: 150 }, { name: "Category B", value: 200 }]
Use: Comparing discrete categories (sales by product, counts by region)

**LINE CHART** - Show trends over time
Data format: [{ name: "Jan", value: 100 }, { name: "Feb", value: 150 }, { name: "Mar", value: 120 }]
Use: Time series, trends, sequential data

**PIE/DONUT CHART** - Show proportions of a whole
Data format: [{ name: "Category A", value: 30 }, { name: "Category B", value: 70 }]
Use: Percentage breakdowns, market share, composition (max 8 categories for readability)

**AREA CHART** - Show cumulative trends
Data format: [{ name: "Q1", value: 1000 }, { name: "Q2", value: 1500 }, { name: "Q3", value: 2000 }]
Use: Cumulative values over time, growth patterns

**SCATTER PLOT** - Show correlations
Data format: [{ x: 20, y: 30, name: "Point A" }, { x: 40, y: 60, name: "Point B" }]
Use: Correlation between two numeric variables

**BUBBLE CHART** - Show 3-variable relationships
Data format: [{ x: 20, y: 30, z: 500, name: "Item A" }, { x: 40, y: 60, z: 800, name: "Item B" }]
Use: x and y are axes, z is bubble size (e.g., sales vs profit vs market share)

**STACKED BAR** - Compare parts of whole across categories
Data format: [{ name: "Q1", series1: 100, series2: 150, series3: 200 }]
series: ["series1", "series2", "series3"]
Use: Show composition across categories (e.g., revenue by product line per quarter)

**GROUPED BAR** - Compare multiple series side by side
Data format: [{ name: "Product A", year2022: 100, year2023: 150, year2024: 200 }]
series: ["year2022", "year2023", "year2024"]
Use: Direct comparison of multiple metrics (e.g., yearly comparisons)

**HORIZONTAL BAR** - Better for long labels
Data format: [{ name: "Very Long Category Name", value: 150 }]
Use: When category names are long or you have many categories

IMPORTANT RULES:
1. Always use actual data from the dataset, never make up numbers
2. For numeric columns, aggregate properly (sum, average, count)
3. For time series, ensure data is in chronological order
4. For scatter/bubble, use numeric values for x, y, and z
5. For multi-series charts (stacked/grouped), include ALL series names in the 'series' array
6. Limit pie charts to 8 slices maximum for readability
7. Always provide descriptive titles and axis labels
8. When data has outliers, consider using scatter/bubble to show them clearly

Choose the chart type that best answers the user's question and reveals insights in the data.`;
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
              description: "Create data visualizations. ALWAYS use real data from the dataset. Format data correctly for each chart type.",
              parameters: {
                type: "object",
                properties: {
                  chartType: {
                    type: "string",
                    enum: ["bar", "line", "pie", "area", "scatter", "bubble", "donut", "stacked-bar", "horizontal-bar", "grouped-bar"],
                    description: "Chart type: bar (categories), line (trends/time), pie/donut (proportions, max 8 slices), area (cumulative), scatter (2 numeric vars), bubble (3 numeric vars), stacked-bar (composition across categories), grouped-bar (side-by-side comparison), horizontal-bar (long labels)"
                  },
                  title: {
                    type: "string",
                    description: "Clear, descriptive title that explains what the chart shows"
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: true
                    },
                    description: "CRITICAL - Data format varies by chart type:\n• bar/line/pie/donut/area/horizontal-bar: [{name: string, value: number}, ...]\n• scatter: [{x: number, y: number, name?: string}, ...] where x and y are numeric values\n• bubble: [{x: number, y: number, z: number, name?: string}, ...] where x, y, z are numeric (z is size)\n• stacked-bar/grouped-bar: [{name: string, seriesName1: number, seriesName2: number, ...}, ...] with 'series' array listing all series names\n\nMust contain actual data from the dataset - never use placeholder values. For aggregations, calculate sum/average/count properly."
                  },
                  xAxisLabel: {
                    type: "string",
                    description: "Label for X axis (e.g., 'Month', 'Product Category', 'Age')"
                  },
                  yAxisLabel: {
                    type: "string",
                    description: "Label for Y axis (e.g., 'Sales ($)', 'Count', 'Revenue')"
                  },
                  series: {
                    type: "array",
                    items: { type: "string" },
                    description: "REQUIRED for stacked-bar and grouped-bar: Array of data key names matching keys in data objects. Example: if data is [{name: 'Q1', product1: 100, product2: 200}], series should be ['product1', 'product2']"
                  }
                },
                required: ["chartType", "title", "data"],
                additionalProperties: false
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
