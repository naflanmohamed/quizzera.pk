import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface TimeDistributionChartProps {
  data: { topic: string; hours: number; color: string }[];
  height?: number;
}

const TimeDistributionChart = ({ data, height = 250 }: TimeDistributionChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="hours"
          nameKey="topic"
          label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TimeDistributionChart;
