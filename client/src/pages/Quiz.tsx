import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

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
import { useAttempt, useSaveAnswer, useSubmitAttempt } from "@/hooks/useQuiz";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Send,
  BookOpen,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Circle,
  Menu,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Quiz = () => {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // API Hooks
  const { data: attemptData, isLoading, error } = useAttempt(attemptId || "");
  const saveAnswer = useSaveAnswer();
  const submitAttempt = useSubmitAttempt();

  // Derived state
  const quiz = attemptData?.quiz;
  const questions = attemptData?.questions || [];
  const attempt = attemptData?.attempt;
  
  const totalQuestions = questions.length || 0;
  const answeredCount = Object.values(selectedAnswers).filter(val => val !== null && val !== undefined).length;
  const markedCount = markedForReview.size;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Initialize state
  useEffect(() => {
    if (attemptData && !isDataLoaded) {
      const savedAnswers: Record<string, number | null> = {};
      const markedSet = new Set<number>();

      questions.forEach((q: any, index: number) => {
        if (q.savedAnswer !== null && q.savedAnswer !== undefined) {
          savedAnswers[q._id] = q.savedAnswer;
        }
        if (q.isMarked) {
          markedSet.add(index);
        }
      });

      setSelectedAnswers(savedAnswers);
      setMarkedForReview(markedSet);

      if (attempt?.timeRemaining !== undefined) {
        setTimeLeft(attempt.timeRemaining);
      } else if (quiz?.duration) {
        setTimeLeft(quiz.duration * 60);
      }

      setIsDataLoaded(true);
    }
  }, [attemptData, isDataLoaded, questions, quiz, attempt]);

  const handleAutoSubmit = useCallback(async () => {
    if (!attemptId || submitAttempt.isPending) return;
    
    try {
      await submitAttempt.mutateAsync({
        attemptId,
        payload: { timeRemaining: 0 }
      });
      navigate(`/quiz/${id}/results/${attemptId}`);
      toast({
        title: "Time's up!",
        description: "Your quiz has been automatically submitted.",
      });
    } catch (error) {
      console.error("Auto-submit failed:", error);
    }
  }, [attemptId, id, navigate, submitAttempt, toast]);

  // Timer
  useEffect(() => {
    if (!isDataLoaded || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isDataLoaded, handleAutoSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = async (optionIndex: number) => {
    if (!questions || !questions[currentQuestion] || !attemptId) return;
    
    const question = questions[currentQuestion];
    
    setSelectedAnswers((prev) => ({
      ...prev,
      [question._id]: optionIndex,
    }));

     // Auto-advance after small delay if not last question
     // Optional: Decide if we want this behavior. For now, let's keep it manual to allow review.
     // if (currentQuestion < totalQuestions - 1) {
     //    setTimeout(() => setCurrentQuestion(prev => prev + 1), 500);
     // }

    try {
      saveAnswer.mutateAsync({
        attemptId,
        questionId: question._id,
        selectedAnswer: optionIndex,
        markedForReview: markedForReview.has(currentQuestion)
      });
    } catch (error) {
       // Error handled by query mutation mostly
    }
  };

  const handleMarkForReview = () => {
    const question = questions[currentQuestion];
    let newMarkedState = false;
    
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
        newMarkedState = false;
      } else {
        newSet.add(currentQuestion);
        newMarkedState = true;
      }
      return newSet;
    });
    
    const currentAnswer = selectedAnswers[question._id];
    if (attemptId) {
       saveAnswer.mutate({
        attemptId,
        questionId: question._id,
        selectedAnswer: currentAnswer !== undefined ? currentAnswer : null,
        markedForReview: newMarkedState
       });
    }
  };

  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    if (!attemptId) return;
    
    try {
      await submitAttempt.mutateAsync({ 
        attemptId, 
        payload: { 
          timeRemaining: timeLeft !== null ? timeLeft : undefined 
        } 
      });

      const searchParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
          navigate(returnTo);
      } else {
          navigate(`/quiz/${id}/results/${attemptId}`);
      }
    } catch (error: any) {
      toast({
          title: "Submission failed",
          description: error.response?.data?.message || "Please try again.",
          variant: "destructive"
      });
    }
  };

  if (isLoading || !isDataLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Preparing your exam environment...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20 shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto text-destructive">
               <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Quiz Unavailable</h1>
            <p className="text-muted-foreground">
              We couldn't load the quiz data. It may have been removed or is no longer accessible.
            </p>
            <Button asChild className="w-full">
              <Link to="/exams">Return to Exams</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col font-sans">
      {/* Immersive Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 h-16">
        <div className="container h-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                 <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                  <h1 className="font-semibold text-sm leading-tight text-foreground max-w-[200px] truncate">
                      {quiz.title}
                  </h1>
                  <span className="text-xs text-muted-foreground">
                      Question {currentQuestion + 1} of {totalQuestions}
                  </span>
              </div>
            </div>
            {/* Mobile Menu Toggle */}
             <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden -ml-2 text-muted-foreground"
                onClick={() => setIsSidebarOpen(true)}
             >
                <Menu className="w-5 h-5" />
             </Button>
          </div>

          {/* Central Timer */}
          <div className={`
              absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm
              ${timeLeft !== null && timeLeft < 300 
                  ? "bg-destructive/10 border-destructive/20 text-destructive animate-pulse" 
                  : "bg-background border-border text-foreground"}
          `}>
             <Clock className="w-4 h-4" />
             <span className="font-mono font-bold text-lg tracking-wider">
                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
             </span>
          </div>

          <div className="flex items-center gap-3">
             <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                className="hidden sm:flex bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all text-white border-0"
             >
                <Send className="w-4 h-4 mr-2" />
                Submit
             </Button>
             <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSubmitDialog(true)}
                className="sm:hidden text-primary"
             >
                <Send className="w-5 h-5" />
             </Button>
          </div>
        </div>
        {/* Progress Line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-muted overflow-hidden">
             <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
             />
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 max-w-5xl">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            
            {/* Question Area */}
            <div className="lg:col-span-8 flex flex-col">
               <Card className="flex-1 border-none shadow-xl shadow-primary/5 overflow-hidden flex flex-col relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkForReview}
                        className={`transition-colors ${markedForReview.has(currentQuestion) ? "text-warning bg-warning/10" : "text-muted-foreground hover:bg-muted"}`}
                      >
                         <Flag className={`w-4 h-4 mr-2 ${markedForReview.has(currentQuestion) ? "fill-current" : ""}`} />
                         {markedForReview.has(currentQuestion) ? "Marked" : "Review"}
                      </Button>
                  </div>

                  <CardContent className="p-8 sm:p-10 flex flex-col gap-8 flex-1">
                      <div className="space-y-6">
                         <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold tracking-wide uppercase">
                             Question {currentQuestion + 1}
                         </span>
                         <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight tracking-tight">
                            {question.question}
                         </h2>
                      </div>

                      <div className="grid gap-4 mt-auto">
                        {question.options.map((option: any, index: number) => (
                           <div
                             key={index}
                             onClick={() => handleSelectAnswer(index)}
                             className={`
                                relative group cursor-pointer rounded-xl p-4 sm:p-5 border-2 transition-all duration-300
                                ${selectedAnswers[question._id] === index
                                    ? "border-primary bg-primary/5 shadow-md scale-[1.01]" 
                                    : "border-border hover:border-primary/30 hover:bg-card"}
                             `}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                                    ${selectedAnswers[question._id] === index
                                        ? "border-primary bg-primary text-primary-foreground" 
                                        : "border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"}
                                 `}>
                                     {selectedAnswers[question._id] === index ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                 </div>
                                 <span className={`text-lg transition-colors ${selectedAnswers[question._id] === index ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}>
                                    {option.text}
                                 </span>
                              </div>
                           </div>
                        ))}
                      </div>
                  </CardContent>

                  {/* Navigation Bar */}
                  <div className="p-6 bg-muted/30 border-t border-border mt-auto">
                     <div className="flex justify-between items-center">
                        <Button
                           variant="ghost"
                           onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                           disabled={currentQuestion === 0}
                           className="hover:bg-background"
                        >
                           <ChevronLeft className="w-5 h-5 mr-2" />
                           Previous
                        </Button>
                        <Button
                           onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
                           disabled={currentQuestion === totalQuestions - 1}
                           className="px-8 bg-foreground text-background hover:bg-foreground/90"
                        >
                           Next Question
                           <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                     </div>
                  </div>
               </Card>
            </div>

            {/* Sidebar / Question Map (Desktop) */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
                <Card className="border-none shadow-lg shadow-primary/5 h-full max-h-[calc(100vh-8rem)] flex flex-col">
                   <CardContent className="p-6 flex flex-col h-full">
                      <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                         <BookOpen className="w-5 h-5 text-primary" />
                         Question Map
                      </h3>
                      
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                         <div className="grid grid-cols-5 gap-2">
                            {questions.map((q: any, i: number) => {
                               const isAnswered = selectedAnswers[q._id] !== undefined && selectedAnswers[q._id] !== null;
                               const isCurrent = currentQuestion === i;
                               const isMarked = markedForReview.has(i);
                               
                               return (
                                  <button
                                     key={i}
                                     onClick={() => setCurrentQuestion(i)}
                                     className={`
                                        aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all relative
                                        ${isCurrent ? "ring-2 ring-primary ring-offset-2 z-10" : ""}
                                        ${isAnswered 
                                            ? "bg-primary/10 text-primary hover:bg-primary/20" 
                                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"}
                                     `}
                                  >
                                     {i + 1}
                                     {isMarked && (
                                         <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-warning shadow-sm" />
                                     )}
                                  </button>
                               )
                            })}
                         </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-border space-y-3">
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-primary/10 border border-primary/20" /> 
                               Answered
                            </span>
                            <span className="font-medium">{answeredCount}</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-warning" /> 
                               Marked
                            </span>
                            <span className="font-medium">{markedCount}</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-secondary" /> 
                               Remaining
                            </span>
                            <span className="font-medium">{totalQuestions - answeredCount}</span>
                         </div>
                      </div>
                   </CardContent>
                </Card>
            </div>
         </div>
      </main>

      {/* Mobile Sidebar (Drawer) */}
      {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
              <div 
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 w-3/4 max-w-sm bg-background border-r border-border shadow-2xl p-6 overflow-y-auto animate-slide-in-left">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-lg">Question Map</h3>
                      <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                          <X className="w-5 h-5" />
                      </Button>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                        {questions.map((q: any, i: number) => (
                              <button
                                    key={i}
                                    onClick={() => {
                                        setCurrentQuestion(i);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`
                                    highlight-none aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all relative
                                    ${currentQuestion === i ? "ring-2 ring-primary ring-offset-2 z-10" : ""}
                                    ${selectedAnswers[q._id] !== undefined && selectedAnswers[q._id] !== null
                                        ? "bg-primary/10 text-primary" 
                                        : "bg-secondary text-muted-foreground"}
                                    `}
                                >
                                    {i + 1}
                                    {markedForReview.has(i) && (
                                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-warning" />
                                    )}
                                </button>
                        ))}
                    </div>
              </div>
          </div>
      )}

      {/* Submit Check Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl">Ready to Finish?</AlertDialogTitle>
            <AlertDialogDescription asChild>
               <div className="space-y-6 pt-4">
                  <div className="flex justify-center gap-8">
                     <div className="text-center space-y-1">
                        <div className="text-3xl font-bold text-primary">{answeredCount}</div>
                        <div className="text-xs uppercase text-muted-foreground font-semibold">Answered</div>
                     </div>
                     <div className="w-px bg-border h-12" />
                     <div className="text-center space-y-1">
                        <div className="text-3xl font-bold text-muted-foreground">{totalQuestions - answeredCount}</div>
                        <div className="text-xs uppercase text-muted-foreground font-semibold">Left</div>
                     </div>
                  </div>
                  
                  {(totalQuestions - answeredCount > 0 || markedCount > 0) && (
                      <div className="bg-warning/10 text-warning p-4 rounded-lg flex items-start gap-3">
                         <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                         <div className="space-y-1">
                             <p className="font-medium text-sm">Attention Needed</p>
                             <p className="text-xs opacity-90">
                                 You have <span className="font-bold">{totalQuestions - answeredCount} unanswered</span> questions 
                                 {markedCount > 0 && <span> and <span className="font-bold">{markedCount} marked</span> for review</span>}.
                             </p>
                         </div>
                      </div>
                  )}
               </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto">Keep Working</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleSubmit} 
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark"
            >
                Submit Attempt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Quiz;
