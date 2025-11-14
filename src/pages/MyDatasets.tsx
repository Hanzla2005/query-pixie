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
        <h2 className="text-3xl font-bold mb-2">My Datasets</h2>
        <p className="text-muted-foreground">Upload and manage your datasets</p>
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
              <DatasetList onSelect={handleSelectDataset} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Data Table */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
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
                      onClick={() => navigate(`/dashboard/preview?datasetId=${selectedDataset}`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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
                <DataTable datasetId={selectedDataset} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TableIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a dataset from the list to view its data</p>
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
