import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  datasetId: string;
}

interface DatasetData {
  headers: string[];
  rows: any[][];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

const DataTable = ({ datasetId }: DataTableProps) => {
  const [data, setData] = useState<DatasetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async (page: number) => {
    setLoading(true);
    console.log("DataTable: Fetching data for datasetId:", datasetId, "page:", page);
    try {
      const { data: result, error } = await supabase.functions.invoke("get-dataset", {
        body: { datasetId, page, pageSize: 50 },
      });

      console.log("DataTable: Response received", { result, error });

      if (error) {
        console.error("DataTable: Error from edge function:", error);
        throw error;
      }
      
      console.log("DataTable: Setting data:", result);
      setData(result);
    } catch (error) {
      console.error("DataTable: Error fetching dataset:", error);
      toast.error("Failed to load dataset");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId) {
      fetchData(currentPage);
    }
  }, [datasetId, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data && currentPage < data.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data || !data.headers || data.headers.length === 0) {
    console.log("DataTable: Showing 'No data available'", { data });
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  const startRow = (currentPage - 1) * (data?.pageSize || 50) + 1;

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 sticky left-0 bg-background">#</TableHead>
              {data.headers.map((column, idx) => (
                <TableHead key={idx} className="min-w-[150px]">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                <TableCell className="font-medium sticky left-0 bg-background">
                  {startRow + rowIdx}
                </TableCell>
                {row.map((cell, cellIdx) => (
                  <TableCell key={cellIdx}>
                    {cell !== null && cell !== undefined ? String(cell) : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {startRow} to {Math.min(startRow + data.rows.length - 1, data.totalRows)} of {data.totalRows} rows
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {data.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === data.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
