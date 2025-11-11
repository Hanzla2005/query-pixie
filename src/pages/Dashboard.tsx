import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Upload, FileText, MessageSquare, BarChart3, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import UploadZone from "@/components/UploadZone";
import ChatInterface from "@/components/ChatInterface";
import DatasetList from "@/components/DatasetList";

const Dashboard = () => {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">DataMind</h1>
          </Link>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Workspace</h2>
          <p className="text-muted-foreground">Upload datasets, analyze data, and chat with AI to discover insights.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Datasets */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Dataset
                </CardTitle>
                <CardDescription>Drop your CSV or XLSX file here</CardDescription>
              </CardHeader>
              <CardContent>
                <UploadZone />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Datasets
                </CardTitle>
                <CardDescription>Recent uploads and analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <DatasetList onSelect={setSelectedDataset} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chat & Analysis */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg h-[calc(100vh-12rem)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  {selectedDataset 
                    ? `Chatting about: ${selectedDataset}`
                    : "Upload a dataset to start analyzing"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <ChatInterface datasetId={selectedDataset} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
