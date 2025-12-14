import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Database, Sparkles, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ChatInterface";
import DatasetSelectorDialog from "@/components/DatasetSelectorDialog";

const AIChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const datasetId = searchParams.get("datasetId");
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleSelectDataset = (selectedDatasetId: string) => {
    navigate(`/dashboard/chat?datasetId=${selectedDatasetId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground/80">AI Assistant</span>
        </div>
        <h2 className="text-4xl font-bold mb-2 gradient-text">AI Chat</h2>
        <p className="text-muted-foreground">Ask questions and get insights about your dataset</p>
      </div>

      <Card className="group hover:shadow-glow transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
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
            <div className="text-center py-16 text-muted-foreground">
              <div className="inline-block p-6 rounded-2xl bg-primary/5 mb-6">
                <Sparkles className="h-16 w-16 text-primary/50" />
              </div>
              <p className="text-xl font-medium mb-2">No dataset selected</p>
              <p className="text-sm mb-6">Select a dataset to start asking questions and generate insights</p>
              <Button onClick={() => setSelectorOpen(true)} className="crystal-button text-primary-foreground">
                <Database className="h-4 w-4 mr-2" />
                Select Dataset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DatasetSelectorDialog
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelectDataset={handleSelectDataset}
      />
    </div>
  );
};

export default AIChatPage;