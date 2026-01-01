import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { PerformanceComparison } from "@/services/api";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts";

interface PerformanceComparisonCardProps {
  comparison: PerformanceComparison;
}

const PerformanceComparisonCard = ({ comparison }: PerformanceComparisonCardProps) => {
  const radarData = comparison.topicComparison.map(item => ({
    topic: item.topic,
    You: item.you,
    Average: item.average,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Percentile Badge */}
        <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold text-primary">
            Top {100 - comparison.percentile}%
          </span>
          <span className="text-sm text-muted-foreground">of all students</span>
        </div>

        {/* Score Comparison */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Your Score</p>
            <p className="text-xl font-bold text-primary">{comparison.yourScore}%</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-xl font-bold text-foreground">{comparison.averageScore}%</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Top Score</p>
            <p className="text-xl font-bold text-success">{comparison.topPerformerScore}%</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="topic" className="text-xs" />
              <Radar name="You" dataKey="You" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
              <Radar name="Average" dataKey="Average" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceComparisonCard;
