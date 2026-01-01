import { Link, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAttemptResults } from "@/hooks/useQuiz";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  Trophy,
  Target,
  BarChart3,
  Home,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

const QuizResults = () => {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const { data: results, isLoading, error } = useAttemptResults(attemptId || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-8">
              <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Results Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Unable to load quiz results. Please try again.
            </p>
            <Button asChild>
              <Link to="/dashboard/quizzes">View My Quizzes</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { quiz, percentage, correctAnswers, incorrectAnswers, skipped, timeTaken, questions } = results;
  
  const isPassed = percentage !== undefined && percentage >= (quiz.passingScore || 50);
  const totalQuestions = questions?.length || quiz.totalQuestions;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-success";
    if (pct >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Result Header */}
          <div className="text-center mb-8">
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                isPassed ? "bg-success/10" : "bg-destructive/10"
              }`}
            >
              {isPassed ? (
                <Trophy className="w-12 h-12 text-success" />
              ) : (
                <Target className="w-12 h-12 text-destructive" />
              )}
            </div>

            <Badge variant={isPassed ? "default" : "destructive"} className="mb-3">
              {isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}
            </Badge>

            <h1 className="text-3xl font-bold text-foreground mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">Quiz completed successfully</p>
          </div>

          {/* Score Display */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold ${getScoreColor(percentage || 0)}`}>
                  {percentage?.toFixed(0)}%
                </div>
                <p className="text-muted-foreground mt-2">
                  {correctAnswers} out of {totalQuestions} correct
                </p>
              </div>

              <Progress value={percentage} className="h-3 mb-6" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-success/5 rounded-xl border border-success/20">
                  <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-success">{correctAnswers}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>

                <div className="text-center p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                  <XCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                  <div className="text-2xl font-bold text-destructive">{incorrectAnswers}</div>
                  <div className="text-xs text-muted-foreground">Incorrect</div>
                </div>

                <div className="text-center p-4 bg-muted rounded-xl border border-border">
                  <MinusCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold">{skipped || 0}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>

                <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">
                    {timeTaken ? formatTime(timeTaken) : "--"}
                  </div>
                  <div className="text-xs text-muted-foreground">Time Taken</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          {questions && questions.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Question Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All ({totalQuestions})</TabsTrigger>
                    <TabsTrigger value="correct">Correct ({correctAnswers})</TabsTrigger>
                    <TabsTrigger value="incorrect">Incorrect ({incorrectAnswers})</TabsTrigger>
                    {skipped && skipped > 0 && (
                      <TabsTrigger value="skipped">Skipped ({skipped})</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {questions.map((q, index) => {
                      const userAnswer = q.userAnswer;
                      const correctOptionIndex = q.options.findIndex((opt) => opt.isCorrect);
                      const isCorrect = userAnswer === correctOptionIndex;
                      const isSkipped = userAnswer === undefined;

                      return (
                        <div
                          key={q._id}
                          className={`p-4 rounded-lg border ${
                            isSkipped
                              ? "border-border bg-muted/30"
                              : isCorrect
                              ? "border-success/30 bg-success/5"
                              : "border-destructive/30 bg-destructive/5"
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{q.questionText}</p>
                            </div>
                            {isSkipped ? (
                              <MinusCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                            ) : isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive shrink-0" />
                            )}
                          </div>

                          <div className="ml-11 space-y-2">
                            {q.options.map((option, optIndex) => {
                              const isUserAnswer = userAnswer === optIndex;
                              const isCorrectOption = option.isCorrect;

                              return (
                                <div
                                  key={optIndex}
                                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                    isCorrectOption
                                      ? "bg-success/10 text-success"
                                      : isUserAnswer
                                      ? "bg-destructive/10 text-destructive"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  <span className="w-6 h-6 rounded flex items-center justify-center bg-background text-xs font-medium">
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <span>{option.text}</span>
                                  {isCorrectOption && (
                                    <CheckCircle2 className="w-4 h-4 ml-auto" />
                                  )}
                                  {isUserAnswer && !isCorrectOption && (
                                    <XCircle className="w-4 h-4 ml-auto" />
                                  )}
                                </div>
                              );
                            })}

                            {q.explanation && (
                              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Explanation:</strong> {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  {/* Similar TabsContent for correct, incorrect, skipped filters */}
                  <TabsContent value="correct" className="space-y-4">
                    {questions
                      .filter((q) => {
                        const correctIdx = q.options.findIndex((opt) => opt.isCorrect);
                        return q.userAnswer === correctIdx;
                      })
                      .map((q) => (
                        <div key={q._id} className="p-4 rounded-lg border border-success/30 bg-success/5">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-success mt-1" />
                            <p className="font-medium">{q.questionText}</p>
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="incorrect" className="space-y-4">
                    {questions
                      .filter((q) => {
                        const correctIdx = q.options.findIndex((opt) => opt.isCorrect);
                        return q.userAnswer !== undefined && q.userAnswer !== correctIdx;
                      })
                      .map((q) => (
                        <div key={q._id} className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                          <div className="flex items-start gap-3 mb-2">
                            <XCircle className="w-5 h-5 text-destructive mt-1" />
                            <p className="font-medium">{q.questionText}</p>
                          </div>
                          {q.explanation && (
                            <p className="ml-8 text-sm text-muted-foreground">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/quiz/${id}`}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/quizzes">
                Browse More Quizzes
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizResults;
