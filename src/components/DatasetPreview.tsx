import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  uniqueCount?: number;
  mostCommon?: string;
  mostCommonPercent?: number;
}

interface PreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  statistics?: Record<string, ColumnStatistics>;
}

const DatasetPreview = ({ datasetId }: DatasetPreviewProps) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!datasetId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-dataset`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ datasetId, page: 1 }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPreviewData(data);
        }
      } catch (error) {
        toast.error("Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [datasetId]);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!previewData?.statistics) return null;

  return (
    <div className="space-y-6">
      {Object.entries(previewData.statistics).map(([column, stats]) => (
        <Card key={column}>
          <CardHeader>
            <CardTitle className="text-base">{column}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.type === 'numeric' ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-48 flex items-end gap-1">
                    {stats.histogram?.map((bin, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-primary/70 rounded-t"
                        style={{ height: `${(bin.count / Math.max(...(stats.histogram?.map(b => b.count) || [1]))) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500" style={{ width: `${stats.validPercent}%` }} />
                    <div className="bg-orange-500" style={{ width: `${stats.missingPercent}%` }} />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>Mean</span><span>{stats.mean?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Min</span><span>{stats.min?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Max</span><span>{stats.max?.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                  <div className="bg-green-500" style={{ width: `${stats.validPercent}%` }} />
                  <div className="bg-orange-500" style={{ width: `${stats.missingPercent}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold">{stats.uniqueCount}</div>
                    <div className="text-sm text-muted-foreground">unique values</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Most Common</div>
                    <div className="font-medium">{stats.mostCommon}</div>
                    <div className="text-xs text-muted-foreground">{stats.mostCommonPercent?.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DatasetPreview;
