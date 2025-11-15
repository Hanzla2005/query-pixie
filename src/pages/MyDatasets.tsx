import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Table as TableIcon, BarChart3, MessageSquare } from "lucide-react";
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
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          My Datasets
        </h2>
        <p className="text-muted-foreground">Upload and manage your datasets with ease</p>
      </div>

      <div className="space-y-6">
        {/* Left Column - Upload & Datasets */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
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

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
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

        {/* Right Column - Data Table */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl h-full border-primary/20 bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TableIcon className="h-5 w-5 text-primary" />
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
                      className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                      onClick={() => navigate(`/dashboard/preview?datasetId=${selectedDataset}`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
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
                  <div className="inline-block p-6 rounded-full bg-primary/5 mb-4">
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
    </div>
  );
};

export default MyDatasets;
