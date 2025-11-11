import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DatasetListProps {
  onSelect: (datasetId: string) => void;
}

interface Dataset {
  id: string;
  name: string;
  created_at: string;
  row_count: number | null;
}

const DatasetList = ({ onSelect }: DatasetListProps) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select("id, name, created_at, row_count")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      toast.error("Failed to load datasets");
    }
  };

  useEffect(() => {
    fetchDatasets();

    // Listen for new uploads
    const handleUpload = () => {
      fetchDatasets();
    };
    window.addEventListener("dataset-uploaded", handleUpload);

    return () => {
      window.removeEventListener("dataset-uploaded", handleUpload);
    };
  }, []);

  const handleSelect = (datasetId: string) => {
    setSelectedId(datasetId);
    onSelect(datasetId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <ScrollArea className="h-64">
      {datasets.length === 0 ? (
        <div className="text-center py-8">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No datasets yet</p>
          <p className="text-xs text-muted-foreground">Upload your first file to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {datasets.map((dataset) => (
            <button
              key={dataset.id}
              onClick={() => handleSelect(dataset.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors group ${
                selectedId === dataset.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <FileSpreadsheet className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{dataset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dataset.row_count !== null ? `${dataset.row_count.toLocaleString()} rows • ` : ""}
                      {formatDate(dataset.created_at)}
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
