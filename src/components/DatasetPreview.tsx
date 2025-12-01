import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Hash, Type } from "lucide-react";
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
  const [hoveredBar, setHoveredBar] = useState<{ column: string; index: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
        <Card key={column} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              {stats.type === 'numeric' ? (
                <Hash className="h-5 w-5 mt-0.5 text-muted-foreground" />
              ) : (
                <Type className="h-5 w-5 mt-0.5 text-muted-foreground" />
              )}
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">{column}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats.type === 'numeric' ? (
              <div className="grid lg:grid-cols-[1fr,400px] gap-8">
                {/* Histogram */}
                <div className="space-y-2">
                  <div className="h-64 flex items-end gap-1 px-2 relative">
                    {stats.histogram?.map((bin, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-[hsl(var(--primary))] rounded-t transition-all hover:opacity-80 cursor-pointer relative"
                        style={{ height: `${(bin.count / Math.max(...(stats.histogram?.map(b => b.count) || [1]))) * 100}%` }}
                        onMouseEnter={(e) => {
                          setHoveredBar({ column, index: idx });
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
                        }}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    ))}
                    {hoveredBar?.column === column && stats.histogram && (
                      <div 
                        className="fixed z-50 bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none"
                        style={{
                          left: `${tooltipPosition.x}px`,
                          top: `${tooltipPosition.y - 60}px`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="font-semibold">
                          {stats.histogram[hoveredBar.index].bin.toFixed(2)} - {stats.histogram[hoveredBar.index].binEnd.toFixed(2)}
                        </div>
                        <div className="text-muted-foreground">
                          Count: {stats.histogram[hoveredBar.index].count}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground px-2">
                    <span>{stats.min?.toFixed(1)}</span>
                    <span>{stats.max?.toFixed(1)}</span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-4">
                  {/* Data Quality */}
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                    <div className="bg-green-500" style={{ width: `${stats.validPercent}%` }} />
                    <div className="bg-gray-400" style={{ width: `${stats.mismatchedPercent}%` }} />
                    <div className="bg-orange-500" style={{ width: `${stats.missingPercent}%` }} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-sm" />
                        <span>Valid</span>
                      </div>
                      <div className="flex gap-4 text-right">
                        <span className="font-medium">{stats.valid}</span>
                        <span className="text-muted-foreground w-12">{stats.validPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                        <span>Mismatched</span>
                      </div>
                      <div className="flex gap-4 text-right">
                        <span className="font-medium">{stats.mismatched}</span>
                        <span className="text-muted-foreground w-12">{stats.mismatchedPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                        <span>Missing</span>
                      </div>
                      <div className="flex gap-4 text-right">
                        <span className="font-medium">{stats.missing}</span>
                        <span className="text-muted-foreground w-12">{stats.missingPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2 text-sm border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Mean</span>
                      <span>{stats.mean?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Std. Deviation</span>
                      <span>{stats.stdDev?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2 text-sm">
                    <div className="font-medium">Quantiles</div>
                    <div className="flex justify-between pl-4">
                      <span>{stats.min?.toFixed(1)}</span>
                      <span className="text-muted-foreground">Min</span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>{stats.q25?.toFixed(1)}</span>
                      <span className="text-muted-foreground">25%</span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>{stats.median?.toFixed(1)}</span>
                      <span className="text-muted-foreground">50%</span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>{stats.q75?.toFixed(1)}</span>
                      <span className="text-muted-foreground">75%</span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>{stats.max?.toFixed(1)}</span>
                      <span className="text-muted-foreground">Max</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[200px,1fr] gap-8">
                {/* Unique Count */}
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-6xl font-bold">{stats.uniqueCount}</div>
                  <div className="text-sm font-medium mt-2">unique values</div>
                </div>

                {/* Statistics */}
                <div className="space-y-4">
                  {/* Data Quality */}
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                    <div className="bg-green-500" style={{ width: `${stats.validPercent}%` }} />
                    <div className="bg-gray-400" style={{ width: `${stats.mismatchedPercent}%` }} />
                    <div className="bg-orange-500" style={{ width: `${stats.missingPercent}%` }} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-sm" />
                        <span>Valid</span>
                      </div>
                      <div className="flex gap-4 text-right">
                        <span className="font-medium">{stats.valid}</span>
                        <span className="text-muted-foreground w-12">{stats.validPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                        <span>Mismatched</span>
                      </div>
                      <div className="flex gap-4 text-right">
                        <span className="font-medium">{stats.mismatched}</span>
                        <span className="text-muted-foreground w-12">{stats.mismatchedPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                        <span>Missing</span>
                      </div>
                      <div className="flex gap-4 text-right">
                        <span className="font-medium">{stats.missing}</span>
                        <span className="text-muted-foreground w-12">{stats.missingPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2 text-sm border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Unique</span>
                      <span>{stats.uniqueCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Most Common</span>
                      <div className="text-right">
                        <div>{stats.mostCommon}</div>
                        <div className="text-muted-foreground text-xs">{stats.mostCommonPercent?.toFixed(0)}%</div>
                      </div>
                    </div>
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
