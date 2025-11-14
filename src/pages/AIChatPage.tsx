import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

const AIChatPage = () => {
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get("datasetId");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">AI Chat</h2>
        <p className="text-muted-foreground">Ask questions and get insights about your dataset</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with AI
          </CardTitle>
          <CardDescription>
            {datasetId 
              ? "Ask questions about your data and generate visualizations" 
              : "Select a dataset from My Datasets to start chatting"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {datasetId ? (
            <ChatInterface datasetId={datasetId} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No dataset selected</p>
              <p className="text-sm mt-2">Go to My Datasets and select a dataset to start chatting</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatPage;
