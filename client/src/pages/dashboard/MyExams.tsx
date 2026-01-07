import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlayCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  Target,
  Trophy,
  AlertCircle
} from "lucide-react";
import { api, ExamAttempt, ExamModel } from "@/services/api";

const MyExams = () => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("in_progress");

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const data = await api.getMyExamAttempts();
        setAttempts(data);
      } catch (error) {
        console.error("Error loading exam attempts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAttempts();
  }, []);

  // Helper to deduplicate attempts by Exam ID, keeping the latest one
  const getUniqueAttempts = (attempts: ExamAttempt[]) => {
      const uniqueMap = new Map();
      attempts.forEach(attempt => {
          // valuable safety check for populated exam
          const examId = typeof attempt.exam === 'string' ? attempt.exam : (attempt.exam as any)._id;
          
          if (!uniqueMap.has(examId)) {
              uniqueMap.set(examId, attempt);
          } else {
              // specific logic: keep the one with later startedAt
              const existing = uniqueMap.get(examId);
              if (new Date(attempt.startedAt) > new Date(existing.startedAt)) {
                  uniqueMap.set(examId, attempt);
              }
          }
      });
      return Array.from(uniqueMap.values());
  };

  const filteredAttempts = getUniqueAttempts(attempts.filter((attempt) => {
    if (activeTab === "in_progress") return attempt.status === "in_progress";
    if (activeTab === "completed") return attempt.status === "completed";
    return false;
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Exams</h2>
          <p className="text-muted-foreground">Track your exam preparation progress</p>
        </div>
        <Button asChild>
          <Link to="/exams">Browse More Exams</Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="in_progress">
            In Progress ({attempts.filter((a) => a.status === "in_progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({attempts.filter((a) => a.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredAttempts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">No exams found</h3>
                <p className="text-muted-foreground mb-4">You don't have any exams in this category.</p>
                <Button asChild>
                  <Link to="/exams">Browse Exams</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAttempts.map((attempt) => {
                 // Safe access to nested exam properties
                 const exam = attempt.exam as unknown as ExamModel;
                 const examTitle = typeof attempt.exam === 'object' ? (attempt.exam as any).title : 'Unknown Exam';
                 const examDesc = typeof attempt.exam === 'object' ? (attempt.exam as any).description : '';
                 const totalQuestions = typeof attempt.exam === 'object' && (attempt.exam as any).quizzes 
                    ? (attempt.exam as any).quizzes.reduce((acc: number, q: any) => acc + (q.quiz?.totalQuestions || 0), 0)
                    : 0;

                 return (
                <Card key={attempt._id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground line-clamp-1">{examTitle}</h3>
                        <p className="text-sm text-muted-foreground">Started {new Date(attempt.startedAt).toLocaleDateString()}</p>
                      </div>
                      {getStatusBadge(attempt.status)}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                      {examDesc || "No description available."}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Score</span>
                        <span className="text-sm font-medium text-foreground">{attempt.score?.percentage || 0}%</span>
                      </div>
                      <Progress value={attempt.score?.percentage || 0} className={attempt.status === 'completed' && (attempt.score?.passed) ? "bg-green-100 [&>div]:bg-green-500" : ""} />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Target className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-muted-foreground">Quizzes</p>
                        <p className="text-sm font-semibold text-foreground">{attempt.quizAttempts?.length || 0}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-warning mb-1">
                          <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-semibold text-foreground">
                            {/* Simple duration calculation since we don't have total time duration easily available without helper */}
                           {attempt.status === 'completed' ? 'Done' : 'Active'}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-success mb-1">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-muted-foreground">Result</p>
                        <p className={`text-sm font-semibold ${attempt.score?.passed ? 'text-green-600' : 'text-foreground'}`}>
                          {attempt.status === 'completed' 
                            ? (attempt.score?.passed ? 'Pass' : 'Fail') 
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {attempt.status === "in_progress" && (
                        <div className="w-full flex gap-2">
                          <Button className="flex-1" asChild>
                            <Link to={`/exam-player/${attempt._id}`}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Continue
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {attempt.status === "completed" && (
                         <div className="w-full flex gap-2">
                          <Button variant="outline" className="flex-1" asChild>
                            <Link to={`/exam-player/${attempt._id}`}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              View Results
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyExams;
