import { useState, useEffect } from "react";
import { FileSpreadsheet, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DatasetSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDataset: (datasetId: string) => void;
}

interface Dataset {
  id: string;
  name: string;
  created_at: string;
  row_count: number | null;
  preprocessing_status: string;
}

const DatasetSelectorDialog = ({ open, onOpenChange, onSelectDataset }: DatasetSelectorDialogProps) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select("id, name, created_at, row_count, preprocessing_status")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      toast.error("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDatasets();
    }
  }, [open]);

  const handleSelectDataset = (datasetId: string) => {
    onSelectDataset(datasetId);
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select a Dataset</DialogTitle>
          <DialogDescription>
            Choose a dataset to analyze and explore
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading datasets...
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No datasets found</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a dataset to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {datasets.map((dataset) => (
                <Button
                  key={dataset.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-muted"
                  onClick={() => handleSelectDataset(dataset.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">{dataset.name}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(dataset.created_at)}
                        </span>
                        {dataset.row_count !== null && (
                          <span>{dataset.row_count.toLocaleString()} rows</span>
                        )}
                        {dataset.preprocessing_status && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            dataset.preprocessing_status === 'completed' 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {dataset.preprocessing_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DatasetSelectorDialog;
