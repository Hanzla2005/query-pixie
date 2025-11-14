import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import DatasetPreview from "@/components/DatasetPreview";

const DataPreviewPage = () => {
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get("datasetId");

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
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No dataset selected</p>
              <p className="text-sm mt-2">Go to My Datasets and select a dataset to view its preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPreviewPage;
