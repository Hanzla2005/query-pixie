import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Upload, FileText, MessageSquare, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UploadZone from "@/components/UploadZone";
import ChatInterface from "@/components/ChatInterface";
import DatasetList from "@/components/DatasetList";
import DatasetPreview from "@/components/DatasetPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserEmail(session.user.email || "");
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      } else if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

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
            <span className="text-sm text-muted-foreground hidden md:inline">{userEmail}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
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
                  Dataset Analysis
                </CardTitle>
                <CardDescription>
                  {selectedDataset 
                    ? "View your data and chat with AI"
                    : "Upload a dataset to start analyzing"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <Tabs defaultValue="chat" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="chat">AI Chat</TabsTrigger>
                    <TabsTrigger value="preview">Data Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chat" className="flex-1 mt-0">
                    <ChatInterface datasetId={selectedDataset} />
                  </TabsContent>
                  <TabsContent value="preview" className="flex-1 mt-0">
                    <DatasetPreview datasetId={selectedDataset} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
