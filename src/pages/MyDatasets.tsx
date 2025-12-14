import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Table as TableIcon, BarChart3, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadZone from "@/components/UploadZone";
import DatasetList from "@/components/DatasetList";
import DataTable from "@/components/DataTable";

const MyDatasets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDataset = searchParams.get("datasetId");
  const navigate = useNavigate();

  const handleSelectDataset = (datasetId: string) => {
    setSearchParams({ datasetId });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground/80">Data Management</span>
        </div>
        <h2 className="text-4xl font-bold mb-2 gradient-text">
          My Datasets
        </h2>
        <p className="text-muted-foreground">Upload and manage your datasets with ease</p>
      </div>

      <div className="space-y-6">
        {/* Upload & Datasets */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="group hover:shadow-glow transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                Upload Dataset
              </CardTitle>
              <CardDescription>Drop your CSV or XLSX file here</CardDescription>
            </CardHeader>
            <CardContent>
              <UploadZone />
            </CardContent>
          </Card>

          <Card className="group hover:shadow-glow transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                Your Datasets
              </CardTitle>
              <CardDescription>Recent uploads and analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetList onSelect={handleSelectDataset} />
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="group hover:shadow-glow transition-all duration-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                    <TableIcon className="h-5 w-5 text-secondary" />
                  </div>
                  Dataset View
                </CardTitle>
                <CardDescription>
                  {selectedDataset
                    ? "View and explore your dataset rows"
                    : "Select a dataset to view its contents"}
                </CardDescription>
              </div>
              {selectedDataset && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                    onClick={() => navigate(`/dashboard/preview?datasetId=${selectedDataset}`)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                    onClick={() => navigate(`/dashboard/chat?datasetId=${selectedDataset}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedDataset ? (
              <div className="w-full overflow-x-auto">
                <DataTable datasetId={selectedDataset} />
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <div className="inline-block p-6 rounded-2xl bg-primary/5 mb-4">
                  <TableIcon className="h-16 w-16 text-primary/50" />
                </div>
                <p className="text-lg font-medium">Select a dataset from the list to view its data</p>
                <p className="text-sm mt-2">Your data tables will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyDatasets;