import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ChartDisplay from "./ChartDisplay";
import Chart3D from "./Chart3D";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  chartData?: {
    chartType: "bar" | "line" | "pie" | "area";
    title: string;
    data: Array<{ name: string; value: number }>;
    xAxisLabel?: string;
    yAxisLabel?: string;
  };
  chart3DData?: {
    xColumn: string;
    yColumn: string;
    zColumn: string;
    title: string;
    data: any[];
    type?: '3d-scatter' | '3d-surface';
    colorColumn?: string;
  };
}

interface ChatInterfaceProps {
  datasetId: string | null;
}

const ChatInterface = ({ datasetId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
                  } else if (functionName === "create_3d_chart" && args.xColumn && args.yColumn && args.zColumn) {
                    setMessages(prev =>
                      prev.map(m =>
                        m.id === assistantMessageId
                          ? { 
                              ...m, 
                              content: assistantContent,
                              chart3DData: args 
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
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 pr-4 overflow-y-auto" ref={scrollRef}>
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
                    />
                  </div>
                )}
                {message.chart3DData && (
                  <div className="mt-4">
                    <Chart3D
                      data={message.chart3DData.data}
                      xColumn={message.chart3DData.xColumn}
                      yColumn={message.chart3DData.yColumn}
                      zColumn={message.chart3DData.zColumn}
                      title={message.chart3DData.title}
                      type={message.chart3DData.type}
                      colorColumn={message.chart3DData.colorColumn}
                    />
                  </div>
                )}
                {!message.chartData && !message.chart3DData && (
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

      <form onSubmit={handleSend} className="mt-4 flex gap-2 flex-shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
