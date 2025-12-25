import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search,
  Filter,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  MinusCircle,
  Calendar,
  TrendingUp
} from "lucide-react";
import { api, QuizAttempt, Exam } from "@/services/api";

const MyQuizzes = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [attemptsData, examsData] = await Promise.all([
          api.getQuizAttempts(),
          api.getExams(),
        ]);
        setAttempts(attemptsData);
        setExams(examsData);
      } catch (error) {
        console.error("Error loading quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch = attempt.quizName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.examName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExam = selectedExam === "all" || attempt.examId === selectedExam;
    
    let matchesScore = true;
    if (scoreFilter === "excellent") matchesScore = attempt.score >= 90;
    else if (scoreFilter === "good") matchesScore = attempt.score >= 70 && attempt.score < 90;
    else if (scoreFilter === "average") matchesScore = attempt.score >= 50 && attempt.score < 70;
    else if (scoreFilter === "poor") matchesScore = attempt.score < 50;

    return matchesSearch && matchesExam && matchesScore;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Quizzes</h2>
        <p className="text-muted-foreground">View and analyze your quiz attempts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={scoreFilter} onValueChange={setScoreFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <TrendingUp className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="excellent">Excellent (90%+)</SelectItem>
            <SelectItem value="good">Good (70-89%)</SelectItem>
            <SelectItem value="average">Average (50-69%)</SelectItem>
            <SelectItem value="poor">Needs Work (&lt;50%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredAttempts.length} of {attempts.length} attempts
      </p>

      {/* Attempts List */}
      {filteredAttempts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No quiz attempts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => (
            <Card
              key={attempt.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAttempt(attempt)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Score Badge */}
                  <div className={`w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0`}>
                    <span className={`text-xl font-bold ${getScoreColor(attempt.score)}`}>
                      {attempt.score}%
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{attempt.quizName}</h3>
                    <p className="text-sm text-muted-foreground">{attempt.examName}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attempt.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span>{attempt.correctAnswers}</span>
                    </div>
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="w-4 h-4" />
                      <span>{attempt.incorrectAnswers}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MinusCircle className="w-4 h-4" />
                      <span>{attempt.skipped}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(attempt.timeTaken)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(attempt.completedAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAttempt?.quizName}</DialogTitle>
          </DialogHeader>
          {selectedAttempt && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(selectedAttempt.score)}`}>
                  {selectedAttempt.score}%
                </div>
                <p className="text-muted-foreground mt-2">{selectedAttempt.examName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-success/10 text-center">
                  <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-success">{selectedAttempt.correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="p-4 rounded-xl bg-destructive/10 text-center">
                  <XCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold text-destructive">{selectedAttempt.incorrectAnswers}</p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-semibold text-foreground">{selectedAttempt.totalQuestions}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div>
                  <MinusCircle className="w-5 h-5 text-warning mx-auto mb-1" />
                  <p className="text-lg font-semibold text-foreground">{selectedAttempt.skipped}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
                <div>
                  <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-semibold text-foreground">{formatTime(selectedAttempt.timeTaken)}</p>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Topics Covered</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAttempt.topics.map((topic) => (
                    <Badge key={topic} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedAttempt(null)}>
                  Close
                </Button>
                <Button variant="gradient" className="flex-1">
                  Review Answers
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyQuizzes;
