import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ChartDisplay from "./ChartDisplay";
import { DataFilterPanel } from "./DataFilterPanel";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  chartData?: {
    chartType: "bar" | "line" | "pie" | "area" | "scatter" | "bubble" | "donut" | "stacked-bar" | "horizontal-bar" | "grouped-bar";
    title: string;
    data: Array<any>;
    xAxisLabel?: string;
    yAxisLabel?: string;
    series?: string[];
  };
}

interface ChatInterfaceProps {
  datasetId: string | null;
}

const ChatInterface = ({ datasetId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [datasetData, setDatasetData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch dataset data for filtering
  useEffect(() => {
    if (datasetId) {
      fetchDatasetData();
    }
  }, [datasetId]);

  const fetchDatasetData = async () => {
    try {
      const { data: dataset } = await supabase
        .from("datasets")
        .select("*")
        .eq("id", datasetId)
        .maybeSingle();

      if (!dataset) return;

      const { data: fileData } = await supabase.storage
        .from("datasets")
        .download(dataset.file_path);

      if (fileData) {
        const text = await fileData.text();
        const rows = text.split('\n').filter(r => r.trim()).slice(0, 1001); // Header + 1000 rows

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
        const parsedData = rows.slice(1).map((row: string) => {
          const values = parseCSVRow(row);
          const obj: any = {};
          headers.forEach((header: string, i: number) => {
            obj[header] = values[i] || '';
          });
          return obj;
        });

        setDatasetData(parsedData);
        setFilteredData(parsedData);

        // Determine column types
        const columnMetadata = headers.map((colName) => {
          const sampleValues = parsedData.slice(0, 100).map((row) => row[colName]);
          const numericValues = sampleValues.filter((v) => !isNaN(parseFloat(v)));
          const isNumeric = numericValues.length / sampleValues.length > 0.8;
          const uniqueCount = new Set(sampleValues).size;
          const isCategorical = uniqueCount < 20 && !isNumeric;

          return {
            name: colName,
            type: isNumeric ? "numeric" as const : isCategorical ? "categorical" as const : "text" as const,
          };
        });

        setColumns(columnMetadata);
      }
    } catch (error) {
      console.error("Error fetching dataset data:", error);
    }
  };

  const handleFilterChange = (newFilteredData: any[], filters: any[]) => {
    setFilteredData(newFilteredData);
    setActiveFilters(filters);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
            datasetId,
            filteredData: activeFilters.length > 0 ? filteredData : undefined,
            filterSummary: activeFilters.length > 0 
              ? `Currently showing ${filteredData.length} of ${datasetData.length} rows with ${activeFilters.length} filter(s) applied.`
              : undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantMessageId = (Date.now() + 1).toString();
      let toolCallBuffer: any = null; // Buffer for accumulating tool call data

      // Add initial assistant message
      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
            
            if (content) {
              assistantContent += content;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMessageId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
            
            // Handle tool calls (accumulate arguments across chunks)
            if (toolCalls && toolCalls[0]) {
              const toolCall = toolCalls[0];
              
              // Initialize buffer if this is the first chunk
              if (toolCall.function?.name && !toolCallBuffer) {
                toolCallBuffer = {
                  name: toolCall.function.name,
                  arguments: ""
                };
              }
              
              // Accumulate arguments
              if (toolCall.function?.arguments) {
                toolCallBuffer.arguments += toolCall.function.arguments;
              }
              
              // Try to parse when we have complete JSON
              if (toolCallBuffer && toolCallBuffer.arguments) {
                try {
                  const args = JSON.parse(toolCallBuffer.arguments);
                  const functionName = toolCallBuffer.name;
                  
                  if (functionName === "create_chart" && args.chartType && args.data) {
                    setMessages(prev =>
                      prev.map(m =>
                        m.id === assistantMessageId
                          ? { 
                              ...m, 
                              content: assistantContent,
                              chartData: args 
                            }
                          : m
                      )
                    );
                    toolCallBuffer = null; // Reset after successful parse
                  }
                } catch (e) {
                  // JSON not complete yet, keep accumulating
                }
              }
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-20rem)] overflow-hidden" role="region" aria-label="Chat conversation">
      {/* Filter Toggle & Summary */}
      {datasetId && datasetData.length > 0 && (
        <div className="mb-4 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-label={showFilters ? "Hide filters" : "Show filters"}
            >
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
            {activeFilters.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Analyzing {filteredData.length} of {datasetData.length} rows
              </p>
            )}
          </div>

          {showFilters && (
            <div className="max-h-96 overflow-auto">
              <DataFilterPanel
                data={datasetData}
                columns={columns}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}
        </div>
      )}

      <ScrollArea className="flex-1 pr-4 overflow-y-auto" ref={scrollRef} role="log" aria-live="polite" aria-relevant="additions">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {datasetId 
                  ? "Start a conversation about your data. Ask questions, request visualizations, or get insights."
                  : "Ask me anything about data analysis, or upload a dataset to begin analyzing your data."}
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground max-w-[80%]"
                    : "w-full"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.chartData && (
                  <div className="mt-4">
                    <ChartDisplay
                      chartType={message.chartData.chartType}
                      title={message.chartData.title}
                      data={message.chartData.data}
                      xAxisLabel={message.chartData.xAxisLabel}
                      yAxisLabel={message.chartData.yAxisLabel}
                      series={message.chartData.series}
                    />
                  </div>
                )}
                {!message.chartData && (
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </div>
              {message.role === "user" && (
                <div className="rounded-full bg-secondary h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="mt-4 flex gap-2 flex-shrink-0" role="search" aria-label="Chat with AI">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data..."
          disabled={isLoading}
          className="flex-1"
          aria-label="Type your message"
          aria-describedby="chat-hint"
          autoComplete="off"
        />
        <span id="chat-hint" className="sr-only">
          {datasetId 
            ? "Ask questions about your dataset or request visualizations" 
            : "Ask general questions about data analysis"}
        </span>
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          aria-label={isLoading ? "Sending message..." : "Send message"}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
