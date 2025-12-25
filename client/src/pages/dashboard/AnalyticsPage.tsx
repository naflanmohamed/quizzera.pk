import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { api, Analytics } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--destructive))"];

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !analytics) {
    return <div className="space-y-6">{[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>
        <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
      </div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold text-primary">{analytics.averageAccuracy}%</p>
          <p className="text-sm text-muted-foreground">Overall Accuracy</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold text-accent">{analytics.totalAttempts}</p>
          <p className="text-sm text-muted-foreground">Total Attempts</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-4xl font-bold text-warning">{analytics.totalStudyHours}h</p>
          <p className="text-sm text-muted-foreground">Study Time</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center flex items-center justify-center gap-2">
          {analytics.recentTrend === "up" ? <TrendingUp className="text-success" /> : <TrendingDown className="text-destructive" />}
          <p className="text-lg font-semibold text-foreground capitalize">{analytics.recentTrend} Trend</p>
        </CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Weekly Progress</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card><CardHeader><CardTitle>Topic Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topicPerformance.map((topic, i) => (
                <div key={topic.topic}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{topic.topic}</span>
                    <span className="text-sm text-muted-foreground">{topic.accuracy}%</span>
                  </div>
                  <Progress value={topic.accuracy} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weak Areas */}
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />Areas to Improve</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {analytics.weakAreas.map((area) => (
              <div key={area.topic} className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                <p className="font-medium text-foreground">{area.topic}</p>
                <p className="text-2xl font-bold text-warning my-2">{area.accuracy}%</p>
                <p className="text-sm text-muted-foreground">{area.recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
