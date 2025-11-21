import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Sparkles, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PreprocessingPreviewProps {
  datasetId: string;
  datasetName: string;
  onConfirm: () => void;
}

interface PreviewData {
  original: {
    rowCount: number;
    sample: string[][];
    headers: string[];
  };
  processed: {
    rowCount: number;
    sample: string[][];
    headers: string[];
  };
  changes: {
    emptyRowsRemoved: number;
    duplicatesRemoved: number;
    cellsImputed: number;
    rowsRetained: number;
    rowsRemovedTotal: number;
  };
  columnChanges: Array<{
    name: string;
    type: string;
    missingBefore: number;
    missingAfter: number;
    missingPercentage: string;
    imputationStrategy: string;
    imputationValue: any;
  }>;
  steps: string[];
}

const PreprocessingPreview = ({ datasetId, datasetName, onConfirm }: PreprocessingPreviewProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const handlePreview = async () => {
    setLoading(true);
    setOpen(true);

    try {
      const { data, error } = await supabase.functions.invoke('preview-preprocessing', {
        body: { datasetId },
      });

      if (error) throw error;

      setPreviewData(data);
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreview}
        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
      >
        <Eye className="h-4 w-4 mr-2" />
        Preview Preprocessing
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Preprocessing Preview: {datasetName}
            </DialogTitle>
            <DialogDescription>
              Review the changes that will be applied to your dataset
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analyzing dataset...</p>
              </div>
            </div>
          ) : previewData ? (
            <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="columns">Column Changes</TabsTrigger>
                <TabsTrigger value="before">Before</TabsTrigger>
                <TabsTrigger value="after">After</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                <TabsContent value="summary" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Overall Changes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Original Rows</p>
                          <p className="text-2xl font-bold">{previewData.original.rowCount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Processed Rows</p>
                          <p className="text-2xl font-bold text-primary">{previewData.processed.rowCount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Rows Removed</p>
                          <p className="text-2xl font-bold text-destructive">{previewData.changes.rowsRemovedTotal.toLocaleString()}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium">Cells Imputed</p>
                            <p className="text-lg font-bold">{previewData.changes.cellsImputed.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Duplicates Removed</p>
                            <p className="text-lg font-bold">{previewData.changes.duplicatesRemoved.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Preprocessing Steps</CardTitle>
                      <CardDescription>Operations that will be performed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {previewData.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="columns" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Column-by-Column Changes</CardTitle>
                      <CardDescription>See how each column will be processed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {previewData.columnChanges.map((col, idx) => (
                          <div key={idx} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{col.name}</h4>
                                <Badge variant={col.type === 'numeric' ? 'default' : 'secondary'}>
                                  {col.type}
                                </Badge>
                              </div>
                              {col.missingBefore > 0 && (
                                <Badge variant="outline">
                                  {col.missingBefore} missing ({col.missingPercentage}%)
                                </Badge>
                              )}
                            </div>
                            {col.missingBefore > 0 && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Strategy:</span> Impute with {col.imputationStrategy} 
                                <span className="ml-2 text-primary font-mono">
                                  ({typeof col.imputationValue === 'number' 
                                    ? col.imputationValue.toFixed(2) 
                                    : col.imputationValue})
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="before" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Original Data Sample</CardTitle>
                      <CardDescription>First 10 rows of your dataset</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-semibold bg-muted">#</th>
                              {previewData.original.headers.map((header, idx) => (
                                <th key={idx} className="text-left p-2 font-semibold bg-muted">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.original.sample.map((row, rowIdx) => (
                              <tr key={rowIdx} className="border-b hover:bg-muted/50">
                                <td className="p-2 text-muted-foreground">{rowIdx + 1}</td>
                                {row.map((cell, cellIdx) => (
                                  <td key={cellIdx} className="p-2">
                                    {cell || <span className="text-destructive italic">missing</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="after" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Processed Data Sample</CardTitle>
                      <CardDescription>First 10 rows after preprocessing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-semibold bg-muted">#</th>
                              {previewData.processed.headers.map((header, idx) => (
                                <th key={idx} className="text-left p-2 font-semibold bg-muted">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.processed.sample.map((row, rowIdx) => (
                              <tr key={rowIdx} className="border-b hover:bg-muted/50">
                                <td className="p-2 text-muted-foreground">{rowIdx + 1}</td>
                                {row.map((cell, cellIdx) => (
                                  <td key={cellIdx} className="p-2">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-primary" disabled={loading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Apply Preprocessing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreprocessingPreview;
