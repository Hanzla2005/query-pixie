import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Database, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatasetPreview from "@/components/DatasetPreview";
import DatasetSelectorDialog from "@/components/DatasetSelectorDialog";

const DataPreviewPage = () => {
  const navigate = useNavigate();
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(true);

  const handleSelectDataset = (selectedDatasetId: string) => {
    setDatasetId(selectedDatasetId);
    setSelectorOpen(false);
  };

  useEffect(() => {
    if (!datasetId) {
      setSelectorOpen(true);
    }
  }, [datasetId]);

  return (
    <>
      <DatasetSelectorDialog
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelectDataset={handleSelectDataset}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          {datasetId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDatasetId(null);
                setSelectorOpen(true);
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Data Preview</h2>
            <p className="text-muted-foreground">View detailed statistics and insights about your dataset</p>
          </div>
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Dataset Statistics
            </CardTitle>
            <CardDescription>
              {datasetId 
                ? "Column statistics, distributions, and data quality metrics" 
                : "Select a dataset to view its statistics"}
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
                <Button 
                  onClick={() => setSelectorOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Select Dataset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DataPreviewPage;
