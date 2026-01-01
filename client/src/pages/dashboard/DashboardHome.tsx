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
  Clock,
  Trophy,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import { api, Exam, QuizAttemptDetail, Analytics } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

const DashboardHome = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptDetail[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [examsData, attemptsData, analyticsData] = await Promise.all([
          api.getExams({ status: "enrolled" }),
          api.getQuizAttempts(),
          api.getAnalytics(),
        ]);
        setExams(examsData.slice(0, 3));
        setAttempts(attemptsData.slice(0, 3));
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
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
        <Card variant="stat">
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

        <Card variant="stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.averageAccuracy || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Hours</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.totalStudyHours || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-success" />
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
        {/* Enrolled Exams */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Continue Preparation</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/exams">
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {exams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No exams enrolled yet.</p>
                  <Button variant="gradient" className="mt-4" asChild>
                    <Link to="/exams">Browse Exams</Link>
                  </Button>
                </div>
              ) : (
                exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{exam.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Next: {exam.nextQuiz || "Complete!"}
                        </p>
                      </div>
                      {exam.dueDate && <Badge variant="secondary">{exam.dueDate}</Badge>}
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={exam.progress} className="flex-1" />
                      <span className="text-sm font-medium text-foreground">
                        {exam.progress}%
                      </span>
                      <Button size="sm" variant="gradient" asChild>
                        <Link to={`/quiz?exam=${exam.id}`}>
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Resume
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
            <CardContent className="space-y-4">
              {attempts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No attempts yet.</p>
                </div>
              ) : (
                attempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{attempt.score}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {attempt.quizName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.correctAnswers}/{attempt.totalQuestions} •{" "}
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
