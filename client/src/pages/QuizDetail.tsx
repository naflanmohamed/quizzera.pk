import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuiz, useStartAttempt } from "@/hooks/useQuiz";
import { useAuth } from "@/hooks/useAuth";
import {
  Clock,
  FileQuestion,
  Trophy,
  AlertCircle,
  Play,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  Users,
} from "lucide-react";

const difficultyColors: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
};

const QuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const { data: quiz, isLoading, error } = useQuiz(id || "");
  const startAttempt = useStartAttempt();

  const handleStartQuiz = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/quiz/${id}` } });
      return;
    }

    if (!id) return;

    try {
      const result = await startAttempt.mutateAsync(id);
      navigate(`/quiz/${id}/attempt/${result.attempt._id}`);
    } catch (error) {
      console.error("Failed to start quiz:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-24 w-full mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The quiz you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/quizzes">Browse Quizzes</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = typeof quiz.category === "object" ? quiz.category.name : quiz.category;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/quizzes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="outline">{categoryName}</Badge>
              <Badge variant="outline" className={difficultyColors[quiz.difficulty]}>
                {quiz.difficulty}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {quiz.title}
            </h1>
            
            <p className="text-lg text-muted-foreground">
              {quiz.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <FileQuestion className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{quiz.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold">{quiz.duration}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold">{quiz.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold">{quiz.totalAttempts?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Attempts</div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {quiz.instructions?.length ? (
                  quiz.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                      <span>{instruction}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                      <span>You have {quiz.duration} minutes to complete this quiz.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                      <span>Each question carries equal marks.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                      <span>You can navigate between questions using the navigator panel.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                      <span>Mark questions for review to come back to them later.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                      <span>The quiz will auto-submit when the timer runs out.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                      <span>Once started, you cannot pause the quiz.</span>
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="text-center">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleStartQuiz}
              disabled={startAttempt.isPending}
              className="px-12"
            >
              {startAttempt.isPending ? (
                <>Loading...</>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Quiz
                </>
              )}
            </Button>
            
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground mt-4">
                You need to{" "}
                <Link to="/login" className="text-primary hover:underline">
                  login
                </Link>{" "}
                to start this quiz.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizDetail;
