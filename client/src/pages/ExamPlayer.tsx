import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, ExamAttempt, ExamModel } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PlayCircle, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ExamPlayer() {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAttempt = async () => {
            if (!attemptId) return;
            try {
                // Get list of attempts
                const attempts = await api.getMyExamAttempts();
                const found = attempts.find(a => a._id === attemptId);
                
                if (found) {
                     // Check if exam data is fully populated
                     let fullExam = found.exam as unknown as ExamModel;
                     
                     // Fallback: If exam is string ID or missing quizzes, fetch explicit details
                     if (typeof found.exam === 'string' || !found.exam || !fullExam.quizzes) {
                         const searchId = typeof found.exam === 'string' ? found.exam : (found.exam as any)._id || (found.exam as any).id;
                         console.log("Exam data incomplete in attempt, fetching explicitly for:", searchId);
                         if (searchId) {
                             const fetchedExam = await api.getExamDetails(searchId);
                             fullExam = fetchedExam;
                             // Merge back into attempt object for local state
                             found.exam = fullExam;
                         }
                     }
                     
                    setAttempt(found);
                } else {
                    toast.error("Attempt not found");
                    navigate("/exams");
                }
            } catch (error) {
                console.error("Failed to load attempt", error);
                toast.error("Failed to load attempt");
            } finally {
                setIsLoading(false);
            }
        };
        loadAttempt();
    }, [attemptId, navigate]);

    const handleQuizStart = async (quizId: string) => {
        try {
            // Start a new quiz attempt
            const { attempt: newAttempt } = await api.startQuizAttempt(quizId, attemptId);
            
            // Navigate to the quiz player with the new attempt ID
            // Pass the returnTo parameter so the user comes back to this exam player
            navigate(`/quiz/${quizId}/attempt/${newAttempt._id}?returnTo=/exam-player/${attemptId}`);
        } catch (error) {
            console.error("Failed to start quiz:", error);
            toast.error("Failed to start quiz");
        }
    };

    const handleSubmitExam = async () => {
        if (!attemptId) return;
        try {
            await api.submitExamAttempt(attemptId);
            toast.success("Exam submitted successfully!");
            navigate("/dashboard/exams"); // Go to results or dashboard
        } catch (error) {
            console.error("Failed to submit exam", error);
            toast.error("Failed to submit exam");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!attempt) return <div className="p-8 text-center">Attempt not found</div>;

    const exam = attempt.exam as ExamModel;

    // Guard against incomplete population or missing data
    if (!exam || typeof exam === 'string' || !exam.quizzes) {
        return (
            <div className="p-8 text-center text-red-500">
                Error: Exam data could not be loaded. Please try again.
                <br />
                <Button variant="outline" className="mt-4 block mx-auto" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    const completedCount = attempt.quizAttempts?.length || 0; // Approximate
    
    // Calculate progress
    const totalQuizzes = exam.quizzes.length;
    const progress = totalQuizzes > 0 ? Math.round((completedCount / totalQuizzes) * 100) : 0;

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20 flex flex-col">
             {/* Header Section */}
             <div className="bg-gradient-to-b from-primary/10 to-background border-b border-primary/5 pb-8 pt-6">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" asChild className="hover:bg-primary/10 -ml-2">
                             <Link to="/exams"><ArrowLeft className="mr-2 h-4 w-4" /> Exit to Library</Link>
                        </Button>
                        <Badge variant="outline" className="px-3 py-1 bg-background/50 backdrop-blur-sm">
                            Status: <span className="font-semibold ml-1 capitalize">{attempt.status}</span>
                        </Badge>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{exam.title}</h1>
                            <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">EXAM IN PROGRESS</span>
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-2xl font-bold">{progress}%</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Completion</div>
                        </div>
                    </div>

                    {/* Progress Bar moved here */}
                    <div className="mt-8 relative">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>{completedCount} of {totalQuizzes} Modules Completed</span>
                            <span className="sm:hidden">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3 bg-secondary/50" />
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-primary" />
                        Examination Modules
                    </h2>
                    
                    <div className="grid gap-4">
                        {exam.quizzes.map((item, index) => {
                            const quiz = typeof item.quiz === 'object' ? item.quiz : { _id: item.quiz, title: 'Unknown', duration: 0 } as any;
                            // Check if this quiz is attempted
                            const quizAttempt = attempt.quizAttempts?.find(qa => 
                                (typeof qa.quiz === 'string' ? qa.quiz : (qa.quiz as any)._id) === quiz._id
                            );
                            const isCompleted = quizAttempt && (quizAttempt.attempt as any)?.status === 'completed'; // deeply nested

                            return (
                                <div key={index} className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${isCompleted ? 'bg-muted/30 border-transparent opacity-80' : 'bg-card hover:shadow-md border-border/50 hover:border-primary/50'}`}>
                                    <div className="p-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${isCompleted ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-primary/5 text-primary border-primary/10'}`}>
                                                {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                            </div>
                                            
                                            <div>
                                                <h3 className={`font-semibold ${isCompleted ? 'text-muted-foreground line-through decoration-border' : ''}`}>{quiz.title}</h3>
                                                <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                                                    <span className="flex items-center">
                                                        <Clock className="mr-1 h-3 w-3" /> {quiz.duration}m
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {quiz.totalQuestions || 0} Questions
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            {isCompleted ? (
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Done
                                                </Badge>
                                            ) : (
                                                <Button size="sm" onClick={() => handleQuizStart(quiz._id)} className="shadow-sm">
                                                    Start <ArrowRight className="ml-2 h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Progress indicator line for active item could go here */}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end pt-8 pb-12 border-t">
                    <Button 
                        size="lg" 
                        onClick={handleSubmitExam} 
                        disabled={completedCount < totalQuizzes}
                        className={completedCount >= totalQuizzes ? "shadow-lg shadow-primary/20 hover:shadow-primary/40" : ""}
                    >
                        {completedCount < totalQuizzes ? `Complete all modules to submit` : `Submit Final Exam`}
                    </Button>
                </div>
            </main>
        </div>
    );
}
