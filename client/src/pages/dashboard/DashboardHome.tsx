import { useState, useEffect, ReactNode  } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  BookOpen,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { api, Quiz, QuizAttemptDetail, Analytics, ExamAttempt } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

  interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    extra?: ReactNode;
  }

/* ============================================
   SIMPLE IN-MEMORY CACHE
============================================ */

let dashboardCache: {
  quizzes?: Quiz[];
  attempts?: QuizAttemptDetail[];
  examAttempts?: ExamAttempt[];
  analytics?: Analytics;
} | null = null;

/* ============================================
   HELPER FUNCTIONS
============================================ */

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

/* ============================================
   LOADING SKELETON
============================================ */

const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>

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

    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/50">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

/* ============================================
   ERROR STATE
============================================ */

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="bg-destructive/10 rounded-full p-6 mb-6">
      <AlertTriangle className="w-12 h-12 text-destructive" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Failed to Load Dashboard</h3>
    <p className="text-muted-foreground mb-6 text-center max-w-md">
      We could not fetch your dashboard data. Please try again.
    </p>
    <Button onClick={onRetry} variant="outline">
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
);

/* ============================================
   EMPTY STATES
============================================ */

const EmptyQuizzesState = () => (
  <div className="text-center py-8">
    <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-4">
      <BookOpen className="w-8 h-8 text-primary" />
    </div>
    <p className="font-medium mb-2">No quizzes available</p>
    <Button asChild>
      <Link to="/quizzes">Browse Quizzes</Link>
    </Button>
  </div>
);

const EmptyAttemptsState = () => (
  <div className="text-center py-8">
    <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
    <p className="text-sm text-muted-foreground">
      Complete a quiz to see results here
    </p>
  </div>
);

/* ============================================
   TREND ICON
============================================ */

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-yellow-500" />;
};

/* ============================================
   MAIN COMPONENT
============================================ */

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is a mentor, redirect to mentor dashboard
    const isMentor = user?.role === 'instructor' || (user?.roles && Array.isArray(user.roles) && user.roles.includes('mentor'));
    if (isMentor) {
      navigate('/dashboard/mentor');
    }
  }, [user, navigate]);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (forceRefresh = false) => {
    setError(null);

    if (dashboardCache && !forceRefresh) {
      setQuizzes(dashboardCache.quizzes || []);
      setAttempts(dashboardCache.attempts || []);
      setExamAttempts(dashboardCache.examAttempts || []); // Load from cache
      setAnalytics(dashboardCache.analytics || null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [quizzesData, attemptsData, analyticsData, examAttemptsData] = await Promise.all([
        api.getQuizzes({ isPublished: true }),
        api.getMyAttempts({ status: "completed" }),
        api.getAnalytics(),
        api.getMyExamAttempts()
      ]);

      const slicedQuizzes = quizzesData.slice(0, 3);
      
      // Map attempts to flattened structure
      const mappedAttempts = (attemptsData as any[]).map(a => ({
        ...a,
        _id: a._id,
        quizName: a.quiz?.title || "Untitled Quiz",
        percentage: typeof a.score === 'object' ? (a.score?.percentage || 0) : (a.score || 0),
        score: typeof a.score === 'object' ? (a.score?.percentage || 0) : (a.score || 0),
        completedAt: a.completedAt || new Date().toISOString()
      }));

      const slicedAttempts = mappedAttempts.slice(0, 5);

      dashboardCache = {
        quizzes: slicedQuizzes,
        attempts: slicedAttempts,
        examAttempts: examAttemptsData,
        analytics: analyticsData,
      };

      setQuizzes(slicedQuizzes);
      setAttempts(slicedAttempts);
      setExamAttempts(examAttemptsData);
      setAnalytics(analyticsData);
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState onRetry={() => fetchDashboardData(true)} />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋
        </h2>
        <p className="text-muted-foreground">
          Track your progress and continue your preparation
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Target />} label="Tests Completed" value={analytics?.testsCompleted ?? 0} />
        <StatCard
          icon={<TrendingUp />}
          label="Avg Accuracy"
          value={`${analytics?.averageAccuracy ?? 0}%`}
          extra={analytics?.recentTrend && <TrendIcon trend={analytics.recentTrend} />}
        />
        <StatCard icon={<Clock />} label="Study Hours" value={`${analytics?.totalStudyHours ?? 0}h`} />
        <StatCard icon={<Trophy />} label="Rank" value={`#${analytics?.rank ?? "-"}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Exams Section */}
          {examAttempts.length > 0 && (
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle>Active Exams</CardTitle>
                <Button variant="ghost" asChild>
                  <Link to="/header/my-exams">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {/* Deduplicate attempts to show unique exams only */}
                {(() => {
                    const uniqueMap = new Map();
                    examAttempts.forEach(attempt => {
                        const examId = typeof attempt.exam === 'string' ? attempt.exam : (attempt.exam as any)._id;
                        if (!uniqueMap.has(examId)) {
                            uniqueMap.set(examId, attempt);
                        } else {
                             const existing = uniqueMap.get(examId);
                             if (new Date(attempt.startedAt) > new Date(existing.startedAt)) {
                                 uniqueMap.set(examId, attempt);
                             }
                        }
                    });
                    const uniqueAttempts = Array.from(uniqueMap.values());

                    return uniqueAttempts.slice(0, 2).map((attempt) => (
                      <div key={attempt._id} className="p-4 rounded-xl bg-primary/5 mb-3 border border-primary/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg line-clamp-1">{attempt.exam.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Started {formatRelativeTime(attempt.startedAt)}
                            </p>
                          </div>
                          <Badge variant={attempt.status === 'completed' ? 'default' : 'secondary'}>
                            {attempt.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                             <span>Progress</span>
                             <span>{attempt.score?.percentage || 0}%</span>
                           </div>
                           <Progress value={attempt.score?.percentage || 0} className="h-2" />
                        </div>

                        <div className="mt-4 flex gap-3">
                            <Button size="sm" className="w-full" asChild>
                                <Link to={`/exam-player/${attempt._id}`}>
                                    {attempt.status === 'completed' ? 'View Results' : 'Continue Exam'}
                                </Link>
                            </Button>
                        </div>
                      </div>
                    ));
                })()}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex justify-between">
              <CardTitle>Continue Preparation</CardTitle>
              <Button variant="ghost" asChild>
                <Link to="/quizzes">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? <EmptyQuizzesState /> : quizzes.map((quiz) => (
                <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
             <CardTitle>Recent Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? <EmptyAttemptsState /> : attempts.map((a) => (
              <AttemptRow key={a._id} attempt={a} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* ============================================
   SMALL COMPONENTS
============================================ */

const StatCard = ({ icon, label, value, extra }: StatCardProps) => (
  <Card>
    <CardContent className="p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {extra}
        </div>
      </div>
    </CardContent>
  </Card>
);


const QuizCard = ({ quiz }: { quiz: Quiz }) => (
  <div className="p-4 rounded-xl bg-muted/50 mb-3">
    <div className="flex justify-between mb-2">
      <h4 className="font-semibold">{quiz.title}</h4>
      <Badge className="capitalize">{quiz.difficulty}</Badge>
    </div>
    <Progress value={quiz.averageScore} />
    <Button size="sm" className="mt-3" asChild>
      <Link to={`/quiz/${quiz._id}`}>
        <PlayCircle className="w-4 h-4 mr-1" />
        Start
      </Link>
    </Button>
  </div>
);

const AttemptRow = ({ attempt }: { attempt: QuizAttemptDetail }) => {
  const score = attempt.percentage || attempt.score || 0;
  return (
    <Link to={`/results/${attempt._id}`} className="flex gap-4 p-3 rounded-lg hover:bg-muted">
      <div className={`w-12 h-12 rounded-xl ${getScoreBgColor(score)} flex items-center justify-center`}>
        <span className={getScoreColor(score)}>{Math.round(score)}%</span>
      </div>
      <div>
        <p className="font-medium">{attempt.quizName}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(attempt.completedAt)}
        </p>
      </div>
    </Link>
  );
};

export default DashboardHome;
