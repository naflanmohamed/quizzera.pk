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
  Trophy
} from "lucide-react";
import { api, Exam } from "@/services/api";

const MyExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enrolled");

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await api.getExams();
        setExams(data);
      } catch (error) {
        console.error("Error loading exams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadExams();
  }, []);

  const filteredExams = exams.filter((exam) => {
    if (activeTab === "enrolled") return exam.status === "enrolled";
    if (activeTab === "completed") return exam.status === "completed";
    return exam.status === "not_started";
  });

  const getStatusBadge = (status: Exam["status"]) => {
    switch (status) {
      case "enrolled":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

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
        <Button variant="gradient" asChild>
          <Link to="/exams">Browse More Exams</Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="enrolled">
            In Progress ({exams.filter((e) => e.status === "enrolled").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({exams.filter((e) => e.status === "completed").length})
          </TabsTrigger>
          <TabsTrigger value="not_started">
            Not Started ({exams.filter((e) => e.status === "not_started").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredExams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No exams in this category</p>
                <Button variant="gradient" asChild>
                  <Link to="/exams">Browse Exams</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{exam.name}</h3>
                        <p className="text-sm text-muted-foreground">{exam.category}</p>
                      </div>
                      {getStatusBadge(exam.status)}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {exam.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium text-foreground">{exam.progress}%</span>
                      </div>
                      <Progress value={exam.progress} />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Target className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-muted-foreground">Questions</p>
                        <p className="text-sm font-semibold text-foreground">{exam.totalQuestions}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-warning mb-1">
                          <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-semibold text-foreground">{exam.duration}m</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-success mb-1">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-muted-foreground">Best</p>
                        <p className="text-sm font-semibold text-foreground">
                          {exam.bestScore ? `${exam.bestScore}%` : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {exam.status === "enrolled" && (
                        <>
                          <Button variant="gradient" className="flex-1" asChild>
                            <Link to={`/quiz?exam=${exam.id}`}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Continue
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {exam.status === "completed" && (
                        <>
                          <Button variant="outline" className="flex-1" asChild>
                            <Link to={`/dashboard/quizzes?exam=${exam.id}`}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              View Results
                            </Link>
                          </Button>
                          <Button variant="gradient" asChild>
                            <Link to={`/quiz?exam=${exam.id}`}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Retry
                            </Link>
                          </Button>
                        </>
                      )}
                      {exam.status === "not_started" && (
                        <Button variant="gradient" className="flex-1" asChild>
                          <Link to={`/quiz?exam=${exam.id}`}>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start Now
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyExams;
