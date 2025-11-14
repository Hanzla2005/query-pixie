import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
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
              <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No dataset selected</p>
              <p className="text-sm mb-4">Select a dataset from My Datasets to view its detailed statistics and column analysis</p>
              <Link to="/dashboard/datasets">
                <Button>
                  <Database className="h-4 w-4 mr-2" />
                  Go to My Datasets
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPreviewPage;
