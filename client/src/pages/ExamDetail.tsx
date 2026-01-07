import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, ExamModel } from "@/services/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Clock, 
    FileQuestion, 
    BookOpen, 
    CheckCircle,
    PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExamDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [exam, setExam] = useState<ExamModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        const loadExam = async () => {
             if (!id) return;
             setIsLoading(true);
             try {
                 const data = await api.getExamDetails(id);
                 setExam(data);
             } catch (error) {
                 console.error("Failed to load exam details", error);
                 toast.error("Failed to load exam details");
                 navigate("/exams");
             } finally {
                 setIsLoading(false);
             }
        };
        loadExam();
    }, [id, navigate]);

    const handleStartExam = async () => {
        if (!exam || !id) return;
        setIsStarting(true);
        try {
            // Check if user is logged in (handled by API/Auth context usually, but good to check)
            const attempt = await api.startExamAttempt(id);
            toast.success("Exam started!");
            // Redirect to exam player
             navigate(`/exam-player/${attempt._id}`); // We need to define this route
        } catch (error) {
            console.error("Failed to start exam", error);
            toast.error("Failed to start exam. You might be already attempting it.");
            // If already attempting, maybe redirect to my attempts?
        } finally {
            setIsStarting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4 py-8 pt-24">
                     <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <Skeleton className="h-64" />
                            <Skeleton className="h-64 md:col-span-2" />
                        </div>
                     </div>
                </main>
            </div>
        );
    }

    if (!exam) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
            <Navbar />
            
            <main className="flex-1 pb-20">
                {/* Hero Section with Glassmorphism */}
                <div className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-32 pb-16 overflow-hidden">
                    {/* Abstract Shapes for visual interest */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-30" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-6">
                            <div className="inline-flex items-center space-x-2 bg-background/50 backdrop-blur-sm border px-3 py-1 rounded-full text-sm font-medium text-muted-foreground shadow-sm">
                                <Badge variant={exam.price === 0 ? "success" : "default"} className="px-2 py-0.5 text-xs">
                                    {exam.price === 0 ? "Free Access" : `$${exam.price} Premium`}
                                </Badge>
                                <span>Professional Certification</span>
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                {exam.title}
                            </h1>
                            
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                {exam.description}
                            </p>

                            <div className="pt-8 flex items-center justify-center gap-4">
                                <Button 
                                    size="lg" 
                                    className="h-14 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                                    onClick={handleStartExam}
                                    disabled={isStarting}
                                >
                                    {isStarting ? (
                                        "Initializing..."
                                    ) : (
                                        <>
                                            <PlayCircle className="mr-2 h-6 w-6" /> Start Exam Now
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Floating Glass Effect */}
                <div className="container mx-auto px-4 -mt-10 relative z-20 mb-16">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-card/70 backdrop-blur-md border-primary/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Duration</p>
                                    <p className="text-3xl font-bold">{exam.duration} <span className="text-sm font-normal text-muted-foreground">mins</span></p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/70 backdrop-blur-md border-primary/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                                    <FileQuestion className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Quizzes</p>
                                    <p className="text-3xl font-bold">{exam.quizzes.length} <span className="text-sm font-normal text-muted-foreground">modules</span></p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/70 backdrop-blur-md border-primary/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pass Score</p>
                                    <p className="text-3xl font-bold">{exam.passResult}% <span className="text-sm font-normal text-muted-foreground">required</span></p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Syllabus Section */}
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-primary" /> 
                                Exam Curriculum
                            </h2>
                            <p className="text-muted-foreground mt-1">Structured learning path for success</p>
                        </div>
                   </div>

                    <div className="space-y-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-border -z-10 hidden md:block"></div>

                        {exam.quizzes.map((item, index) => {
                             const quiz = typeof item.quiz === 'object' ? item.quiz : { title: 'Unknown Quiz' } as any;
                             return (
                                <div key={index} className="group relative">
                                    <Card className="transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                                        <div className="flex items-center p-6 gap-6">
                                            {/* Number Badge */}
                                            <div className="flex-shrink-0 relative">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <span className="text-2xl font-bold text-primary opacity-80 group-hover:opacity-100">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold truncate pr-4 group-hover:text-primary transition-colors">
                                                    {quiz.title}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-md">
                                                        <Clock className="w-3.5 h-3.5" /> 
                                                        {quiz.duration || 0} mins
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-md">
                                                        <FileQuestion className="w-3.5 h-3.5" /> 
                                                        {quiz.totalQuestions || 0} Questions
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Icon */}
                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <PlayCircle className="w-5 h-5" />
                                                 </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                             );
                        })}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
