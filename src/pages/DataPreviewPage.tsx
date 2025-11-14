import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatasetPreview from "@/components/DatasetPreview";
import DatasetSelectorDialog from "@/components/DatasetSelectorDialog";

const DataPreviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const datasetId = searchParams.get("datasetId");
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleSelectDataset = (selectedDatasetId: string) => {
    navigate(`/dashboard/preview?datasetId=${selectedDatasetId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Data Preview</h2>
        <p className="text-muted-foreground">View detailed statistics and insights about your dataset</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dataset Statistics
          </CardTitle>
          <CardDescription>
            {datasetId 
              ? "Column statistics, distributions, and data quality metrics" 
              : "Select a dataset from My Datasets to view its statistics"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {datasetId ? (
            <DatasetPreview datasetId={datasetId} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No dataset selected</p>
              <p className="text-sm mb-4">Select a dataset to view its detailed statistics and column analysis</p>
              <Button onClick={() => setSelectorOpen(true)}>
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

export default DataPreviewPage;
