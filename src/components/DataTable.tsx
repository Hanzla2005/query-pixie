import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
  columns: string[];
  rows: any[][];
}

const DataTable = ({ datasetId }: DataTableProps) => {
  const [data, setData] = useState<DatasetData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    console.log("DataTable: Fetching data for datasetId:", datasetId);
    try {
      const { data: result, error } = await supabase.functions.invoke("get-dataset", {
        body: { datasetId, limit: 100 },
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
      fetchData();
    }
  }, [datasetId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data || !data.columns || data.columns.length === 0) {
    console.log("DataTable: Showing 'No data available'", { data });
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 sticky left-0 bg-background">#</TableHead>
            {data.columns.map((column, idx) => (
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
                {rowIdx + 1}
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
  );
};

export default DataTable;
