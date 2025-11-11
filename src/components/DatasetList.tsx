import { Button } from "@/components/ui/button";
import { FileSpreadsheet, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DatasetListProps {
  onSelect: (datasetId: string) => void;
}

const DatasetList = ({ onSelect }: DatasetListProps) => {
  // Placeholder data - will be replaced with real data from Lovable Cloud
  const placeholderDatasets = [
    { id: "1", name: "sales_data_2024.csv", uploadedAt: "2 hours ago", rows: 1245 },
    { id: "2", name: "customer_analytics.xlsx", uploadedAt: "1 day ago", rows: 5680 },
  ];

  return (
    <ScrollArea className="h-64">
      {placeholderDatasets.length === 0 ? (
        <div className="text-center py-8">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No datasets yet</p>
          <p className="text-xs text-muted-foreground">Upload your first file to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {placeholderDatasets.map((dataset) => (
            <button
              key={dataset.id}
              onClick={() => onSelect(dataset.id)}
              className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <FileSpreadsheet className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{dataset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dataset.rows.toLocaleString()} rows • {dataset.uploadedAt}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </button>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

export default DatasetList;
