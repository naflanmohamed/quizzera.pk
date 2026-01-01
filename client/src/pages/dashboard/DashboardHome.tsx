import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Trophy,
  PlayCircle,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { api, Quiz, QuizAttemptDetail, Analytics } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

// ============================================
// HELPER FUNCTIONS
// ============================================

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
};

const getScoreBgColor = (score: number) => {
  if (score >= 70) return "bg-green-500/10";
  if (score >= 50) return "bg-yellow-500/10";
  return "bg-red-500/10";
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ============================================
// LOADING SKELETON COMPONENT
// ============================================

const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Welcome Section Skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>

    {/* Stats Grid Skeleton */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Content Grid Skeleton */}
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/50">
              <div className="flex justify-between mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-2 flex-1" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

// ============================================
// ERROR STATE COMPONENT
// ============================================

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="bg-destructive/10 rounded-full p-6 mb-6">
      <AlertTriangle className="w-12 h-12 text-destructive" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">
      Failed to Load Dashboard
    </h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      We couldn't fetch your dashboard data. Please check your connection and try again.
    </p>
    <Button onClick={onRetry} variant="outline">
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
);

// ============================================
// EMPTY STATE COMPONENTS
// ============================================

const EmptyQuizzesState = () => (
  <div className="text-center py-8">
    <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-4">
      <BookOpen className="w-8 h-8 text-primary" />
    </div>
    <p className="text-foreground font-medium mb-2">No quizzes enrolled yet</p>
    <p className="text-sm text-muted-foreground mb-4">
      Start your learning journey by browsing our quizzes
    </p>
    <Button variant="default" asChild>
      <Link to="/quizzes">Browse Quizzes</Link>
    </Button>
  </div>
);

const EmptyAttemptsState = () => (
  <div className="text-center py-8">
    <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
      <FileText className="w-8 h-8 text-muted-foreground" />
    </div>
    <p className="text-foreground font-medium mb-1">No attempts yet</p>
    <p className="text-sm text-muted-foreground">
      Complete a quiz to see your results here
    </p>
  </div>
);

// ============================================
// TREND ICON COMPONENT
// ============================================

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case "down":
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-yellow-500" />;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const DashboardHome = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptDetail[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [quizzesData, attemptsData, analyticsData] = await Promise.all([
        api.getQuizzes({ isPublished: true }),
        api.getMyAttempts({ status: "completed" }),
        api.getAnalytics(),
      ]);
      setQuizzes(quizzesData.slice(0, 3));
      setAttempts(attemptsData.slice(0, 5));
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading State
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error State
  if (error) {
    return <ErrorState onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
        </h2>
        <p className="text-muted-foreground">
          Track your progress and continue your exam preparation.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tests Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.testsCompleted || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
                  {analytics?.recentTrend && (
                    <TrendIcon trend={analytics.recentTrend} />
                  )}
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(analytics?.averageAccuracy || 0)}`}>
                  {analytics?.averageAccuracy || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Hours</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.totalStudyHours || 0}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold text-foreground">
                  #{analytics?.rank || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Quizzes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Continue Preparation</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/quizzes">
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {quizzes.length === 0 ? (
                <EmptyQuizzesState />
              ) : (
                quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">
                          {quiz.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {quiz.totalQuestions} questions • {quiz.duration} mins
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge 
                          variant={
                            quiz.difficulty === "easy" ? "secondary" :
                            quiz.difficulty === "medium" ? "default" :
                            quiz.difficulty === "hard" ? "destructive" : "outline"
                          }
                          className="capitalize"
                        >
                          {quiz.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          {quiz.totalAttempts} attempts • Avg: {quiz.averageScore}%
                        </p>
                        <Progress 
                          value={quiz.averageScore} 
                          className={`h-2 ${
                            quiz.averageScore >= 70 
                              ? '[&>div]:bg-green-500' 
                              : quiz.averageScore >= 50 
                                ? '[&>div]:bg-yellow-500' 
                                : '[&>div]:bg-red-500'
                          }`}
                        />
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/quiz/${quiz._id}`}>
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Start
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Attempts</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/quizzes">
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {attempts.length === 0 ? (
                <EmptyAttemptsState />
              ) : (
                attempts.map((attempt) => {
                  const score = attempt.percentage || attempt.score || 0;
                  return (
                    <Link
                      key={attempt._id}
                      to={`/results/${attempt._id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className={`w-12 h-12 rounded-xl ${getScoreBgColor(score)} flex items-center justify-center`}>
                        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                          {Math.round(score)}%
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {attempt.quizName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.correctAnswers}/{attempt.totalQuestions} correct • {formatRelativeTime(attempt.completedAt)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
