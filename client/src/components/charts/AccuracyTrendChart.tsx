import {XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";

interface AccuracyTrendChartProps {
  data: { date: string; accuracy: number }[];
  height?: number;
}

const AccuracyTrendChart = ({ data, height = 200 }: AccuracyTrendChartProps) => {
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: format(new Date(item.date), "MMM d"),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="dateLabel" className="text-xs" />
        <YAxis domain={[0, 100]} className="text-xs" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--background))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px"
          }}
        />
        <Area 
          type="monotone" 
          dataKey="accuracy" 
          stroke="hsl(var(--primary))" 
          fill="url(#accuracyGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AccuracyTrendChart;
