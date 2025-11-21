import React, { useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Box } from 'lucide-react';

interface Chart3DProps {
  data: any[];
  xColumn: string;
  yColumn: string;
  zColumn: string;
  title: string;
  type?: '3d-scatter' | '3d-surface';
  colorColumn?: string;
}

const Chart3D = ({ data, xColumn, yColumn, zColumn, title, type = '3d-scatter', colorColumn }: Chart3DProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>No data available for 3D visualization</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const x = data.map(row => parseFloat(row[xColumn])).filter(v => !isNaN(v));
  const y = data.map(row => parseFloat(row[yColumn])).filter(v => !isNaN(v));
  const z = data.map(row => parseFloat(row[zColumn])).filter(v => !isNaN(v));
  
  const colors = colorColumn 
    ? data.map(row => row[colorColumn])
    : x;

  const plotData: any = type === '3d-scatter' ? [{
    type: 'scatter3d',
    mode: 'markers',
    x,
    y,
    z,
    marker: {
      size: 5,
      color: colors,
      colorscale: [
        [0, 'hsl(180, 80%, 50%)'],
        [0.25, 'hsl(280, 70%, 60%)'],
        [0.5, 'hsl(20, 90%, 55%)'],
        [0.75, 'hsl(340, 80%, 60%)'],
        [1, 'hsl(160, 75%, 45%)']
      ],
      showscale: true,
      line: {
        color: 'rgba(255, 255, 255, 0.3)',
        width: 0.5
      }
    },
    text: data.map(row => `${xColumn}: ${row[xColumn]}<br>${yColumn}: ${row[yColumn]}<br>${zColumn}: ${row[zColumn]}`),
    hoverinfo: 'text'
  }] : [{
    type: 'surface',
    x: Array.from(new Set(x)).sort((a, b) => a - b),
    y: Array.from(new Set(y)).sort((a, b) => a - b),
    z: [z],
    colorscale: [
      [0, 'hsl(180, 80%, 50%)'],
      [0.5, 'hsl(280, 70%, 60%)'],
      [1, 'hsl(20, 90%, 55%)']
    ],
    showscale: true
  }];

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>
          Interactive 3D visualization showing relationships between {xColumn}, {yColumn}, and {zColumn}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Plot
          data={plotData}
          layout={{
            autosize: true,
            height: 500,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            scene: {
              xaxis: { 
                title: xColumn,
                gridcolor: 'rgba(128, 128, 128, 0.2)',
                showbackground: true,
                backgroundcolor: 'rgba(0, 0, 0, 0.05)'
              },
              yaxis: { 
                title: yColumn,
                gridcolor: 'rgba(128, 128, 128, 0.2)',
                showbackground: true,
                backgroundcolor: 'rgba(0, 0, 0, 0.05)'
              },
              zaxis: { 
                title: zColumn,
                gridcolor: 'rgba(128, 128, 128, 0.2)',
                showbackground: true,
                backgroundcolor: 'rgba(0, 0, 0, 0.05)'
              },
              camera: {
                eye: { x: 1.5, y: 1.5, z: 1.5 }
              }
            },
            margin: { l: 0, r: 0, b: 0, t: 0 }
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['toImage']
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </CardContent>
    </Card>
  );
};

export default Chart3D;
