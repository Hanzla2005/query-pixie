import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, MoreVertical, RefreshCw, BarChart3, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PreprocessingPreview from "@/components/PreprocessingPreview";

interface DatasetListProps {
  onSelect: (datasetId: string) => void;
}

interface Dataset {
  id: string;
  name: string;
  created_at: string;
  row_count: number | null;
  preprocessing_status: string;
  original_row_count: number | null;
  preprocessing_metadata: any;
}

const DatasetList = ({ onSelect }: DatasetListProps) => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select("id, name, created_at, row_count, preprocessing_status, original_row_count, preprocessing_metadata")
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
    
    // Dispatch event for navigation updates
    window.dispatchEvent(new CustomEvent("dataset-selected", { detail: { datasetId } }));
  };

  const handleReprocess = async (datasetId: string, datasetName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setProcessingIds(prev => new Set(prev).add(datasetId));
    const loadingToast = toast.loading(`Reprocessing ${datasetName}...`);

    try {
      const { data, error } = await supabase.functions.invoke('preprocess-dataset', {
        body: { datasetId },
      });

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success(`${datasetName} reprocessed successfully!`);
      
      // Refresh the dataset list
      await fetchDatasets();
      
      // If this dataset is currently selected, trigger a refresh
      if (selectedId === datasetId) {
        window.dispatchEvent(new CustomEvent("dataset-reprocessed"));
      }
    } catch (error) {
      console.error("Reprocess error:", error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to reprocess ${datasetName}: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(datasetId);
        return newSet;
      });
    }
  };

  const handleDeleteClick = (dataset: Dataset, e: React.MouseEvent) => {
    e.stopPropagation();
    setDatasetToDelete(dataset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!datasetToDelete) return;

    const loadingToast = toast.loading(`Deleting ${datasetToDelete.name}...`);

    try {
      // First, get the dataset to find the file path
      const { data: dataset, error: fetchError } = await supabase
        .from("datasets")
        .select("file_path")
        .eq("id", datasetToDelete.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the file from storage
      if (dataset?.file_path) {
        const { error: storageError } = await supabase.storage
          .from("datasets")
          .remove([dataset.file_path]);

        if (storageError) {
          console.warn("Storage delete error:", storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete the dataset from the database
      const { error: deleteError } = await supabase
        .from("datasets")
        .delete()
        .eq("id", datasetToDelete.id);

      if (deleteError) throw deleteError;

      toast.dismiss(loadingToast);
      toast.success(`${datasetToDelete.name} deleted successfully!`);

      // Clear selection if the deleted dataset was selected
      if (selectedId === datasetToDelete.id) {
        setSelectedId(null);
        onSelect("");
      }

      // Refresh the dataset list
      await fetchDatasets();
    } catch (error) {
      console.error("Delete error:", error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to delete ${datasetToDelete.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setDeleteDialogOpen(false);
      setDatasetToDelete(null);
    }
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
    <>
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
                      {dataset.row_count !== null ? `${dataset.row_count.toLocaleString()} rows` : ""}
                      {dataset.preprocessing_status === 'completed' && dataset.original_row_count && dataset.original_row_count !== dataset.row_count
                        ? ` (cleaned from ${dataset.original_row_count.toLocaleString()})`
                        : ""}
                      {dataset.row_count !== null ? " • " : ""}
                      {dataset.preprocessing_status === 'pending' ? "Processing... • " : ""}
                      {formatDate(dataset.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <PreprocessingPreview
                      datasetId={dataset.id}
                      datasetName={dataset.name}
                      onConfirm={() => handleReprocess(dataset.id, dataset.name, {} as React.MouseEvent)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/overview?id=${dataset.id}`);
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Overview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleReprocess(dataset.id, dataset.name, e)}
                        disabled={processingIds.has(dataset.id)}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${processingIds.has(dataset.id) ? 'animate-spin' : ''}`} />
                        {processingIds.has(dataset.id) ? 'Processing...' : 'Reprocess Data'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(dataset, e)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Dataset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </ScrollArea>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">{datasetToDelete?.name}</span>?
            This action cannot be undone. The dataset file and all associated data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};

export default DatasetList;
