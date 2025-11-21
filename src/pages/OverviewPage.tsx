import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowLeft, TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, Database, Box } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DatasetSelectorDialog from "@/components/DatasetSelectorDialog";
import Chart3D from "@/components/Chart3D";

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
];

const OverviewPage = () => {
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('id');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (datasetId) {
      fetchDatasetOverview();
    } else {
      setLoading(false);
    }
  }, [datasetId]);

  const handleSelectDataset = (selectedDatasetId: string) => {
    navigate(`/dashboard/overview?id=${selectedDatasetId}`);
  };

  const fetchDatasetOverview = async () => {
    try {
      setLoading(true);
      toast.loading("Analyzing dataset with AI...");

      // Call AI-powered overview generation
      const { data: overviewData, error: overviewError } = await supabase.functions.invoke(
        "generate-overview",
        { body: { datasetId } }
      );

      if (overviewError) {
        console.error("Overview generation error:", overviewError);
        throw overviewError;
      }

      console.log("AI Overview data:", overviewData);

      setDataset(overviewData.dataset);
      setData(overviewData.sampleData || []);

      // Transform AI insights into statistics format
      const insights = overviewData.insights;
      const stats: any = {
        totalRows: overviewData.dataset.row_count,
        summary: insights.summary,
        keyFindings: insights.keyFindings || [],
        columns: {},
        distributions: {},
        trends: {}
      };

      // Process numeric insights
      insights.numericInsights?.forEach((insight: any) => {
        console.log(`Processing insight for ${insight.columnName}:`, {
          hasDistribution: !!insight.distribution,
          distributionLength: insight.distribution?.length || 0
        });
        
        stats.columns[insight.columnName] = {
          type: 'numeric',
          mean: insight.mean,
          median: insight.median,
          min: insight.min,
          max: insight.max,
          stdDev: insight.stdDev,
          trend: insight.trend,
          description: insight.description
        };

        // Use distribution data from the insight
        if (insight.distribution && insight.distribution.length > 0) {
          stats.distributions[insight.columnName] = insight.distribution;
          console.log(`Added distribution for ${insight.columnName}:`, stats.distributions[insight.columnName]);
        } else {
          console.warn(`No distribution data for ${insight.columnName}`);
        }
      });
      
      console.log("Final distributions:", Object.keys(stats.distributions));

      // Process categorical insights
      insights.categoricalInsights?.forEach((insight: any) => {
        stats.columns[insight.columnName] = {
          type: 'categorical',
          unique: insight.uniqueCount,
          topValues: insight.topValues,
          description: insight.description
        };

        stats.distributions[insight.columnName] = insight.topValues || [];
      });

      setStatistics(stats);
      toast.dismiss();
      toast.success("Dataset analysis completed!");
    } catch (error) {
      console.error("Error fetching dataset overview:", error);
      toast.dismiss();
      toast.error("Failed to load dataset overview");
    } finally {
      setLoading(false);
    }
  };


  const downloadReport = async () => {
    if (!reportRef.current) return;

    try {
      setIsDownloading(true);
      toast.loading("Generating report...");

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Title page
      pdf.setFontSize(24);
      pdf.setTextColor(139, 92, 246); // Primary color
      pdf.text("DataMind", margin, 30);
      
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Dataset Overview Report", margin, 45);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Dataset: ${dataset.name}`, margin, 55);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 62);
      pdf.text(`Total Rows: ${statistics.totalRows?.toLocaleString() || 0}`, margin, 69);

      // Capture each visualization section
      const sections = reportRef.current.querySelectorAll('.report-section');
      let yOffset = 85;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        if (yOffset > pageHeight - 50) {
          pdf.addPage();
          yOffset = 20;
        }

        const canvas = await html2canvas(section, {
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yOffset + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yOffset = 20;
        }

        pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      }

      pdf.save(`${dataset.name.replace(/[^a-z0-9]/gi, '_')}_overview_report.pdf`);
      toast.dismiss();
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.dismiss();
      toast.error("Failed to generate report");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!datasetId) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Dataset Overview
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive analysis and visualizations</p>
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Overview Dashboard
            </CardTitle>
            <CardDescription>
              Select a dataset to view comprehensive trends and visualizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No dataset selected</p>
              <p className="text-sm mb-4">Select a dataset to view detailed trends, distributions, and download comprehensive reports</p>
              <Button onClick={() => setSelectorOpen(true)} className="bg-gradient-to-r from-primary to-primary/80">
                <Database className="h-4 w-4 mr-2" />
                Select Dataset
              </Button>
            </div>
          </CardContent>
        </Card>

        <DatasetSelectorDialog
          open={selectorOpen}
          onOpenChange={setSelectorOpen}
          onSelectDataset={handleSelectDataset}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!dataset || !statistics.totalRows) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No data available for this dataset</p>
            <Button onClick={() => navigate("/dashboard/datasets")} className="mt-4">
              Back to Datasets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const numericColumns = Object.entries(statistics.columns)
    .filter(([_, info]: any) => info.type === 'numeric');
  const categoricalColumns = Object.entries(statistics.columns)
    .filter(([_, info]: any) => info.type === 'categorical');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/datasets")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Dataset Overview
            </h1>
            <p className="text-muted-foreground mt-1">{dataset.name}</p>
          </div>
        </div>
        <Button
          onClick={downloadReport}
          disabled={isDownloading}
          className="bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-glow"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="space-y-6">
        {/* AI Summary */}
        {statistics.summary && (
          <Card className="report-section border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>AI-Generated Summary</CardTitle>
              </div>
              <CardDescription>
                Comprehensive overview generated by AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{statistics.summary}</p>
              {statistics.keyFindings && statistics.keyFindings.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Key Findings:</h4>
                  <ul className="space-y-2">
                    {statistics.keyFindings.map((finding: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary Statistics */}
        <Card className="report-section border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Dataset Metrics</CardTitle>
            </div>
            <CardDescription>
              Overview of key metrics and data characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Total Rows</p>
                <p className="text-2xl font-bold text-primary">{statistics.totalRows?.toLocaleString() || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <p className="text-sm text-muted-foreground">Columns</p>
                <p className="text-2xl font-bold">{Object.keys(statistics.columns || {}).length}</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-sm text-muted-foreground">Numeric Columns</p>
                <p className="text-2xl font-bold">{numericColumns.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-sm text-muted-foreground">Categorical Columns</p>
                <p className="text-2xl font-bold">{categoricalColumns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Numeric Insights */}
        {numericColumns.map(([colName, colInfo]: any) => (
          <Card key={`numeric-${colName}`} className="report-section border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>{colName} - Analysis</CardTitle>
              </div>
              <CardDescription>
                {colInfo.description || `Statistical analysis for ${colName}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {colInfo.mean && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Mean</p>
                    <p className="text-lg font-bold">{typeof colInfo.mean === 'number' ? colInfo.mean.toFixed(2) : colInfo.mean}</p>
                  </div>
                )}
                {colInfo.median && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Median</p>
                    <p className="text-lg font-bold">{typeof colInfo.median === 'number' ? colInfo.median.toFixed(2) : colInfo.median}</p>
                  </div>
                )}
                {colInfo.min && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="text-lg font-bold">{typeof colInfo.min === 'number' ? colInfo.min.toFixed(2) : colInfo.min}</p>
                  </div>
                )}
                {colInfo.max && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Max</p>
                    <p className="text-lg font-bold">{typeof colInfo.max === 'number' ? colInfo.max.toFixed(2) : colInfo.max}</p>
                  </div>
                )}
              </div>
              {colInfo.trend && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm"><span className="font-semibold">Trend:</span> {colInfo.trend}</p>
                </div>
              )}
              {statistics.distributions[colName] && statistics.distributions[colName].length > 0 ? (
                <ResponsiveContainer width="100%" height={300} className="mt-6">
                  <BarChart data={statistics.distributions[colName]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="mt-6 p-8 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Distribution chart unavailable - data may require cleaning</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Trend Analysis */}
        {Object.entries(statistics.trends).map(([colName, trendData]: any) => (
          trendData && trendData.length > 0 && (
            <Card key={`trend-${colName}`} className="report-section border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>{colName} - Trend Analysis</CardTitle>
                </div>
                <CardDescription>
                  Time-series visualization showing how values change across the dataset. 
                  This helps identify patterns, seasonality, and anomalies in the data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id={`gradient-${colName}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill={`url(#gradient-${colName})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )
        ))}

        {/* Categorical Insights */}
        {categoricalColumns.slice(0, 4).map(([colName, colInfo]: any) => {
          const hasDistribution = statistics.distributions[colName] && statistics.distributions[colName].length > 0;
          return (
            <Card key={`cat-${colName}`} className="report-section border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  <CardTitle>{colName} - Category Distribution</CardTitle>
                </div>
                <CardDescription>
                  {colInfo.description || `Distribution showing the proportion of each category in ${colName}.`}
                  {colInfo.unique && ` Total unique values: ${colInfo.unique}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasDistribution ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statistics.distributions[colName]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey={statistics.distributions[colName][0]?.value !== undefined ? "value" : "count"}
                        >
                          {statistics.distributions[colName].map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statistics.distributions[colName]} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey={statistics.distributions[colName][0]?.value !== undefined ? "value" : "count"} fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="p-8 bg-muted/30 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Distribution chart unavailable</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* 3D Visualizations */}
        {numericColumns.length >= 3 && data.length > 0 && (
          <>
            <Card className="report-section border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-primary" />
                  <CardTitle>3D Relationship Analysis</CardTitle>
                </div>
                <CardDescription>
                  Interactive 3D scatter plots showing multi-dimensional relationships between numeric variables.
                  Rotate, zoom, and pan to explore data from different angles.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* First 3D chart with first three numeric columns */}
            <Chart3D
              data={data}
              xColumn={numericColumns[0][0]}
              yColumn={numericColumns[1][0]}
              zColumn={numericColumns[2][0]}
              title={`3D Analysis: ${numericColumns[0][0]} vs ${numericColumns[1][0]} vs ${numericColumns[2][0]}`}
              type="3d-scatter"
              colorColumn={categoricalColumns.length > 0 ? categoricalColumns[0][0] : undefined}
            />

            {/* If we have 4+ numeric columns, add another 3D chart */}
            {numericColumns.length >= 4 && (
              <Chart3D
                data={data}
                xColumn={numericColumns[0][0]}
                yColumn={numericColumns[2][0]}
                zColumn={numericColumns[3][0]}
                title={`3D Analysis: ${numericColumns[0][0]} vs ${numericColumns[2][0]} vs ${numericColumns[3][0]}`}
                type="3d-scatter"
                colorColumn={categoricalColumns.length > 0 ? categoricalColumns[0][0] : undefined}
              />
            )}
          </>
        )}

        {/* Detailed Statistics Table */}
        {numericColumns.length > 0 && (
          <Card className="report-section border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>Detailed Column Statistics</CardTitle>
              <CardDescription>
                Comprehensive statistical summary for all numeric columns in the dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold">Column</th>
                      <th className="text-right p-3 font-semibold">Mean</th>
                      <th className="text-right p-3 font-semibold">Median</th>
                      <th className="text-right p-3 font-semibold">Min</th>
                      <th className="text-right p-3 font-semibold">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numericColumns.map(([colName, colInfo]: any) => (
                      <tr key={colName} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 font-medium">{colName}</td>
                        <td className="text-right p-3">{typeof colInfo.mean === 'number' ? colInfo.mean.toFixed(2) : colInfo.mean || '-'}</td>
                        <td className="text-right p-3">{typeof colInfo.median === 'number' ? colInfo.median.toFixed(2) : colInfo.median || '-'}</td>
                        <td className="text-right p-3">{typeof colInfo.min === 'number' ? colInfo.min.toFixed(2) : colInfo.min || '-'}</td>
                        <td className="text-right p-3">{typeof colInfo.max === 'number' ? colInfo.max.toFixed(2) : colInfo.max || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
