import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DatasetPreviewProps {
  datasetId: string | null;
}

interface ColumnStatistics {
  type: string;
  valid: number;
  mismatched: number;
  missing: number;
  validPercent: number;
  mismatchedPercent: number;
  missingPercent: number;
  mean?: number;
  stdDev?: number;
  min?: number;
  q25?: number;
  median?: number;
  q75?: number;
  max?: number;
  histogram?: { bin: number; binEnd: number; count: number }[];
}

interface PreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  statistics?: Record<string, ColumnStatistics>;
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

  useEffect(() => {
    const handleReprocess = () => {
      if (datasetId) {
        setCurrentPage(1);
        fetchPreview(1);
      }
    };

    window.addEventListener("dataset-reprocessed", handleReprocess);
    return () => {
      window.removeEventListener("dataset-reprocessed", handleReprocess);
    };
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
    <div className="flex flex-col h-full gap-6">
      {previewData.statistics && Object.keys(previewData.statistics).length > 0 && (
        <div className="space-y-6">
          {Object.entries(previewData.statistics).map(([column, stats]) => (
            <Card key={column} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{column}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Histogram */}
                  <div className="space-y-2">
                    <div className="h-48 flex items-end gap-1">
                      {stats.histogram?.map((bin, idx) => {
                        const maxCount = Math.max(...(stats.histogram?.map(b => b.count) || [1]));
                        const height = (bin.count / maxCount) * 100;
                        return (
                          <div
                            key={idx}
                            className="flex-1 bg-primary/70 hover:bg-primary transition-colors rounded-t"
                            style={{ height: `${height}%` }}
                            title={`${bin.bin.toFixed(1)} - ${bin.binEnd.toFixed(1)}: ${bin.count}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stats.min?.toFixed(1)}</span>
                      <span>{stats.max?.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="space-y-4">
                    {/* Valid/Mismatched/Missing bars */}
                    <div className="space-y-2">
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500"
                          style={{ width: `${stats.validPercent}%` }}
                        />
                        <div
                          className="bg-gray-400"
                          style={{ width: `${stats.mismatchedPercent}%` }}
                        />
                        <div
                          className="bg-orange-500"
                          style={{ width: `${stats.missingPercent}%` }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-sm" />
                            <span>Valid</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="font-medium">{stats.valid}</span>
                            <span className="text-muted-foreground">{stats.validPercent.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                            <span>Mismatched</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="font-medium">{stats.mismatched}</span>
                            <span className="text-muted-foreground">{stats.mismatchedPercent.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                            <span>Missing</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="font-medium">{stats.missing}</span>
                            <span className="text-muted-foreground">{stats.missingPercent.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mean and Std Deviation */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mean</span>
                        <span className="font-medium">{stats.mean?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Std. Deviation</span>
                        <span className="font-medium">{stats.stdDev?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Quantiles */}
                    <div className="space-y-1 pt-2 border-t border-border">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Quantiles</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground"></span>
                        <div className="flex gap-8">
                          <span className="font-medium">{stats.min?.toFixed(0)}</span>
                          <span className="text-muted-foreground">Min</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground"></span>
                        <div className="flex gap-8">
                          <span className="font-medium">{stats.q25?.toFixed(0)}</span>
                          <span className="text-muted-foreground">25%</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground"></span>
                        <div className="flex gap-8">
                          <span className="font-medium">{stats.median?.toFixed(0)}</span>
                          <span className="text-muted-foreground">50%</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground"></span>
                        <div className="flex gap-8">
                          <span className="font-medium">{stats.q75?.toFixed(0)}</span>
                          <span className="text-muted-foreground">75%</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground"></span>
                        <div className="flex gap-8">
                          <span className="font-medium">{stats.max?.toFixed(0)}</span>
                          <span className="text-muted-foreground">Max</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
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
