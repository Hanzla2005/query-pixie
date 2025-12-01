import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ZAxis,
} from "recharts";

interface ChartDisplayProps {
  chartType: "bar" | "line" | "pie" | "area" | "scatter" | "bubble" | "donut" | "stacked-bar" | "horizontal-bar" | "grouped-bar";
  title: string;
  data: Array<any>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  series?: string[]; // For multi-series charts
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

const ChartDisplay = ({
  chartType,
  title,
  data,
  xAxisLabel,
  yAxisLabel,
  series = [],
}: ChartDisplayProps) => {
  // Validate and prepare data
  if (!data || data.length === 0) {
    return (
      <Card className="w-full shadow-lg border-2 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-8">No data available for visualization</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="name" 
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
                className="text-sm"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
                className="text-sm"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="name" 
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
                className="text-sm"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
                className="text-sm"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[0]}
                strokeWidth={3} 
                dot={{ fill: COLORS[0], r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: 'hsl(var(--foreground))',
                  strokeWidth: 1
                }}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="name" 
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
                className="text-sm"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
                className="text-sm"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[0]}
                strokeWidth={3}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="x"
                type="number"
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                dataKey="y"
                type="number"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Legend />
              <Scatter name={title} data={data} fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "bubble":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="x"
                type="number"
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                dataKey="y"
                type="number"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <ZAxis dataKey="z" range={[50, 1000]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Legend />
              <Scatter name={title} data={data} fill={COLORS[0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "donut":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: 'hsl(var(--foreground))',
                  strokeWidth: 1
                }}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                innerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        );

      case "stacked-bar":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="name" 
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend />
              {series.length > 0 ? (
                series.map((s, idx) => (
                  <Bar 
                    key={s} 
                    dataKey={s} 
                    stackId="stack" 
                    fill={COLORS[idx % COLORS.length]}
                    radius={idx === series.length - 1 ? [8, 8, 0, 0] : undefined}
                  />
                ))
              ) : (
                <Bar dataKey="value" stackId="stack" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "horizontal-bar":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                type="number"
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "grouped-bar":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="name" 
                label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend />
              {series.length > 0 ? (
                series.map((s, idx) => (
                  <Bar 
                    key={s} 
                    dataKey={s} 
                    fill={COLORS[idx % COLORS.length]}
                    radius={[8, 8, 0, 0]}
                  />
                ))
              ) : (
                <Bar dataKey="value" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartDisplay;
