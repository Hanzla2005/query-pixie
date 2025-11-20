import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowLeft, TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DatasetSelectorDialog from "@/components/DatasetSelectorDialog";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const OverviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDatasetSelect = (datasetId: string) => {
    setDialogOpen(false);
    fetchDatasetOverview(datasetId);
  };

  useEffect(() => {
    if (!dataset) {
      setDialogOpen(true);
    }
  }, [dataset]);

  const fetchDatasetOverview = async (datasetId: string) => {
    try {
      setLoading(true);

      // Fetch dataset info
      const { data: datasetInfo, error: datasetError } = await supabase
        .from("datasets")
        .select("*")
        .eq("id", datasetId)
        .single();

      if (datasetError) throw datasetError;
      setDataset(datasetInfo);

      // Fetch dataset data
      const { data: datasetData, error: dataError } = await supabase.functions.invoke(
        "get-dataset",
        { body: { datasetId } }
      );

      if (dataError) throw dataError;

      const parsedData = datasetData.data;
      setData(parsedData);

      // Calculate statistics
      calculateStatistics(parsedData, datasetInfo.columns);
    } catch (error) {
      console.error("Error fetching dataset overview:", error);
      toast.error("Failed to load dataset overview");
      setDataset(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: any[], columns: any) => {
    const stats: any = {
      totalRows: data.length,
      columns: {},
      distributions: {},
      trends: {},
      correlations: []
    };

    if (!data.length || !columns) return;

    const columnNames = Object.keys(data[0]);
    
    columnNames.forEach(col => {
      const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
      const columnInfo = columns.find((c: any) => c.name === col);
      
      if (columnInfo?.type === 'number') {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const mean = sum / numericValues.length;
        const sorted = [...numericValues].sort((a, b) => a - b);
        
        stats.columns[col] = {
          type: 'numeric',
          count: numericValues.length,
          mean: mean.toFixed(2),
          median: sorted[Math.floor(sorted.length / 2)]?.toFixed(2),
          min: Math.min(...numericValues).toFixed(2),
          max: Math.max(...numericValues).toFixed(2),
          stdDev: Math.sqrt(numericValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numericValues.length).toFixed(2)
        };

        // Distribution for numeric columns (histogram-like)
        const bins = 10;
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const binSize = (max - min) / bins;
        const distribution = Array(bins).fill(0);
        
        numericValues.forEach(v => {
          const binIndex = Math.min(Math.floor((v - min) / binSize), bins - 1);
          distribution[binIndex]++;
        });

        stats.distributions[col] = distribution.map((count, i) => ({
          range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
          count
        }));

        // Trend analysis (if there's an index or row number)
        if (numericValues.length > 10) {
          stats.trends[col] = numericValues.slice(0, Math.min(50, numericValues.length)).map((v, i) => ({
            index: i + 1,
            value: v
          }));
        }
      } else {
        // Categorical analysis
        const valueCounts: { [key: string]: number } = {};
        values.forEach(v => {
          const key = String(v).substring(0, 50); // Limit length
          valueCounts[key] = (valueCounts[key] || 0) + 1;
        });

        const sortedValues = Object.entries(valueCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);

        stats.columns[col] = {
          type: 'categorical',
          count: values.length,
          unique: Object.keys(valueCounts).length,
          topValues: sortedValues
        };

        stats.distributions[col] = sortedValues.map(([value, count]) => ({
          name: value.length > 20 ? value.substring(0, 20) + '...' : value,
          value: count
        }));
      }
    });

    setStatistics(stats);
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
    <>
      <DatasetSelectorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelectDataset={handleDatasetSelect}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDataset(null);
                setDialogOpen(true);
              }}
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
        {/* Summary Statistics */}
        <Card className="report-section border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Summary Statistics</CardTitle>
            </div>
            <CardDescription>
              Overview of key metrics and data characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Total Rows</p>
                <p className="text-2xl font-bold text-primary">{statistics.totalRows.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <p className="text-sm text-muted-foreground">Columns</p>
                <p className="text-2xl font-bold">{Object.keys(statistics.columns).length}</p>
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

        {/* Numeric Distributions */}
        {numericColumns.map(([colName, colInfo]: any) => (
          statistics.distributions[colName] && (
            <Card key={`dist-${colName}`} className="report-section border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>{colName} - Distribution</CardTitle>
                </div>
                <CardDescription>
                  Statistical distribution showing the frequency of values across different ranges. 
                  Mean: {colInfo.mean}, Median: {colInfo.median}, Std Dev: {colInfo.stdDev}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
              </CardContent>
            </Card>
          )
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

        {/* Categorical Distributions */}
        {categoricalColumns.slice(0, 4).map(([colName, colInfo]: any) => (
          statistics.distributions[colName] && (
            <Card key={`cat-${colName}`} className="report-section border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  <CardTitle>{colName} - Category Distribution</CardTitle>
                </div>
                <CardDescription>
                  Breakdown of categorical values showing the proportion of each category. 
                  Total unique values: {colInfo.unique}, Showing top {statistics.distributions[colName].length} categories.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                        dataKey="value"
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
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )
        ))}

        {/* Detailed Statistics Table */}
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
                    <th className="text-right p-3 font-semibold">Count</th>
                    <th className="text-right p-3 font-semibold">Mean</th>
                    <th className="text-right p-3 font-semibold">Median</th>
                    <th className="text-right p-3 font-semibold">Min</th>
                    <th className="text-right p-3 font-semibold">Max</th>
                    <th className="text-right p-3 font-semibold">Std Dev</th>
                  </tr>
                </thead>
                <tbody>
                  {numericColumns.map(([colName, colInfo]: any) => (
                    <tr key={colName} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-medium">{colName}</td>
                      <td className="text-right p-3">{colInfo.count.toLocaleString()}</td>
                      <td className="text-right p-3">{colInfo.mean}</td>
                      <td className="text-right p-3">{colInfo.median}</td>
                      <td className="text-right p-3">{colInfo.min}</td>
                      <td className="text-right p-3">{colInfo.max}</td>
                      <td className="text-right p-3">{colInfo.stdDev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
};

export default OverviewPage;
