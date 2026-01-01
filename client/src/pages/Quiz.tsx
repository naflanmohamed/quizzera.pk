import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuiz, useQuizQuestions, useSaveAnswer, useSubmitAttempt } from "@/hooks/useQuiz";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Send,
  BookOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";

const Quiz = () => {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const navigate = useNavigate();
  
  // State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerInitializedId, setTimerInitializedId] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // API Hooks
  const { data: quiz, isLoading: quizLoading } = useQuiz(id || "");
  const { data: questions, isLoading: questionsLoading } = useQuizQuestions(id || "", attemptId);
  const saveAnswer = useSaveAnswer();
  const submitAttempt = useSubmitAttempt();

  const isLoading = quizLoading || questionsLoading;
  const totalQuestions = questions?.length || 0;
  const answeredCount = Object.keys(selectedAnswers).length;
  const markedCount = markedForReview.size;

  // Initialize timer when quiz loads
  if (quiz?.duration && id && timerInitializedId !== id) {
    setTimerInitializedId(id);
    setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
  }

  const handleAutoSubmit = useCallback(async () => {
    if (!attemptId) return;
    
    try {
      await submitAttempt.mutateAsync(attemptId);
      navigate(`/quiz/${id}/results/${attemptId}`);
    } catch (error) {
      console.error("Auto-submit failed:", error);
    }
  }, [attemptId, id, navigate, submitAttempt]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      handleAutoSubmit();
    }
  }, [timeLeft, handleAutoSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = async (optionIndex: number) => {
    if (!questions || !attemptId) return;
    
    const question = questions[currentQuestion];
    
    setSelectedAnswers((prev) => ({
      ...prev,
      [question._id]: optionIndex,
    }));

    // Save to backend
    try {
      await saveAnswer.mutateAsync({
        attemptId,
        questionId: question._id,
        selectedOption: optionIndex,
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };



  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    
    if (!attemptId) return;
    
    try {
      await submitAttempt.mutateAsync(attemptId);
      navigate(`/quiz/${id}/results/${attemptId}`);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!quiz || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Quiz Not Available</h1>
            <p className="text-muted-foreground mb-6">
              Unable to load quiz questions. Please try again.
            </p>
            <Button asChild>
              <Link to="/quizzes">Back to Quizzes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline font-medium truncate max-w-[200px]">
                  {quiz.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft !== null && timeLeft < 300
                    ? "bg-destructive/10 text-destructive animate-pulse"
                    : "bg-muted"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">
                  {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                </span>
              </div>

              <Button
                variant="gradient"
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitAttempt.isPending}
              >
                {submitAttempt.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Submit</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Progress value={(answeredCount / totalQuestions) * 100} className="flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {answeredCount}/{totalQuestions} answered
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="category">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </Badge>
                  <Button
                    variant={markedForReview.has(currentQuestion) ? "accent" : "ghost"}
                    size="sm"
                    onClick={handleMarkForReview}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {markedForReview.has(currentQuestion) ? "Marked" : "Mark for Review"}
                  </Button>
                </div>

                <h2 className="text-xl font-semibold text-foreground mb-8">
                  {question.questionText}
                </h2>

                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={saveAnswer.isPending}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAnswers[question._id] === index
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      } ${saveAnswer.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm ${
                            selectedAnswers[question._id] === index
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-foreground">{option.text}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    onClick={() =>
                      setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))
                    }
                    disabled={currentQuestion === totalQuestions - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-4">Question Navigator</h3>

                <div className="grid grid-cols-5 gap-2 mb-6">
                  {questions.map((q, index) => (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors relative ${
                        currentQuestion === index
                          ? "bg-primary text-primary-foreground"
                          : selectedAnswers[q._id] !== undefined
                          ? "bg-success/10 text-success border border-success/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {index + 1}
                      {markedForReview.has(index) && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-success/10 border border-success/30" />
                    <span className="text-muted-foreground">Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-muted" />
                    <span className="text-muted-foreground">
                      Not Answered ({totalQuestions - answeredCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-warning" />
                    <span className="text-muted-foreground">Marked ({markedCount})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>Are you sure you want to submit your quiz?</p>
                <div className="bg-muted p-4 rounded-lg mt-4 space-y-1">
                  <p>
                    <strong>Answered:</strong> {answeredCount} of {totalQuestions}
                  </p>
                  <p>
                    <strong>Marked for Review:</strong> {markedCount}
                  </p>
                  <p>
                    <strong>Unanswered:</strong> {totalQuestions - answeredCount}
                  </p>
                </div>
                {totalQuestions - answeredCount > 0 && (
                  <p className="text-warning text-sm mt-2">
                    You have {totalQuestions - answeredCount} unanswered question(s).
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit Quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Quiz;
