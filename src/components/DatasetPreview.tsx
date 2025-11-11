import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DatasetPreviewProps {
  datasetId: string | null;
}

interface PreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

const DatasetPreview = ({ datasetId }: DatasetPreviewProps) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPreview = async (page: number) => {
    if (!datasetId) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-dataset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ datasetId, page, pageSize: 50 }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load dataset");
      }

      const data = await response.json();
      setPreviewData(data);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching preview:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load dataset preview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId) {
      setCurrentPage(1);
      fetchPreview(1);
    } else {
      setPreviewData(null);
    }
  }, [datasetId]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchPreview(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (previewData && currentPage < previewData.totalPages) {
      fetchPreview(currentPage + 1);
    }
  };

  if (!datasetId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a dataset to preview its contents</p>
      </div>
    );
  }

  if (loading && !previewData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!previewData) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              {previewData.headers.map((header, idx) => (
                <TableHead key={idx} className="font-semibold whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.rows.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <TableCell key={cellIdx} className="whitespace-nowrap">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * previewData.pageSize) + 1} to{" "}
          {Math.min(currentPage * previewData.pageSize, previewData.totalRows)} of{" "}
          {previewData.totalRows.toLocaleString()} rows
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {previewData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === previewData.totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DatasetPreview;
