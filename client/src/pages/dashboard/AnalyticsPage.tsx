import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  AlertTriangle, 
  BookOpen,
  Clock,
  Award,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { api, Analytics } from "@/services/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

// Custom Tooltip for Bar Chart
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-primary">
          Score: <span className="font-bold">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Loading Skeleton Component
const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-20 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="bg-primary/10 rounded-full p-6 mb-6">
      <BookOpen className="w-12 h-12 text-primary" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">No Analytics Yet</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      Start taking quizzes to see your performance analytics. Your progress, scores, and areas for improvement will appear here.
    </p>
    <Button onClick={() => window.location.href = '/quizzes'}>
      <Target className="w-4 h-4 mr-2" />
      Browse Quizzes
    </Button>
  </div>
);

// Error State Component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="bg-destructive/10 rounded-full p-6 mb-6">
      <AlertTriangle className="w-12 h-12 text-destructive" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">Failed to Load Analytics</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      We couldn't fetch your analytics data. Please check your connection and try again.
    </p>
    <Button onClick={onRetry} variant="outline">
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
);

// Trend Icon Component
const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-6 h-6 text-green-500" />;
    case "down":
      return <TrendingDown className="w-6 h-6 text-red-500" />;
    default:
      return <Minus className="w-6 h-6 text-yellow-500" />;
  }
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Loading State
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  // Error State
  if (error) {
    return <ErrorState onRetry={fetchAnalytics} />;
  }

  // Empty State (no attempts yet)
  if (!analytics || analytics.totalAttempts === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>
        <p className="text-muted-foreground">
          Track your progress and identify areas for improvement
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-primary mr-2" />
            </div>
            <p className="text-4xl font-bold text-primary">{analytics.averageAccuracy}%</p>
            <p className="text-sm text-muted-foreground">Overall Accuracy</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-blue-500 mr-2" />
            </div>
            <p className="text-4xl font-bold text-blue-500">{analytics.totalAttempts}</p>
            <p className="text-sm text-muted-foreground">Total Attempts</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-500 mr-2" />
            </div>
            <p className="text-4xl font-bold text-orange-500">{analytics.totalStudyHours}h</p>
            <p className="text-sm text-muted-foreground">Study Time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendIcon trend={analytics.recentTrend} />
            </div>
            <p className="text-lg font-semibold text-foreground capitalize">
              {analytics.recentTrend} Trend
            </p>
            <p className="text-sm text-muted-foreground">vs Last Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="score" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Topic Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Topic Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topicPerformance.length > 0 ? (
              <div className="space-y-4">
                {analytics.topicPerformance.slice(0, 5).map((topic) => (
                  <div key={topic.topic}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {topic.topic}
                      </span>
                      <span className={`text-sm font-medium ${
                        topic.accuracy >= 70 
                          ? 'text-green-500' 
                          : topic.accuracy >= 50 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                      }`}>
                        {topic.accuracy}%
                      </span>
                    </div>
                    <Progress 
                      value={topic.accuracy} 
                      className={`h-2 ${
                        topic.accuracy >= 70 
                          ? '[&>div]:bg-green-500' 
                          : topic.accuracy >= 50 
                            ? '[&>div]:bg-yellow-500' 
                            : '[&>div]:bg-red-500'
                      }`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No topic data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weak Areas Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {analytics.weakAreas.length > 0 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Areas to Improve
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                Great Performance!
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.weakAreas.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.weakAreas.map((area) => (
                <div
                  key={area.topic}
                  className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-colors"
                >
                  <p className="font-medium text-foreground truncate">{area.topic}</p>
                  <p className={`text-2xl font-bold my-2 ${
                    area.accuracy < 50 ? 'text-red-500' : 'text-orange-500'
                  }`}>
                    {area.accuracy}%
                  </p>
                  <p className="text-sm text-muted-foreground">{area.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-green-500/10 rounded-full p-4 w-fit mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-foreground font-medium">No weak areas detected!</p>
              <p className="text-muted-foreground text-sm mt-1">
                You're performing well across all topics. Keep up the great work!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
