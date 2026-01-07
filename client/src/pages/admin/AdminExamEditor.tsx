import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, ExamModel, Quiz } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminExamEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [exam, setExam] = useState<ExamModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Quiz selection state
    const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");

    useEffect(() => {
        const loadExam = async () => {
            if (!id) return;
            try {
                const [examData, quizzesData] = await Promise.all([
                    api.getExamDetails(id),
                    api.getQuizzes() // Get all quizzes to select from
                ]);
                setExam(examData);
                setAllQuizzes(quizzesData);
            } catch (error) {
                console.error("Error loading exam:", error);
                toast.error("Failed to load exam details");
                navigate("/admin/exams");
            } finally {
                setIsLoading(false);
            }
        };
        loadExam();
    }, [id, navigate]);

    const handleSave = async (updatedExam?: ExamModel) => {
        const examToSave = updatedExam || exam;
        if (!examToSave || !id) return;
        setIsSaving(true);
        try {
            // Transform quizzes to match backend expectation
            // 1. Map to just ID or string
            // 2. Remove temporary _id that causes CastError
            const examData = {
                ...examToSave,
                quizzes: examToSave.quizzes.map(item => {
                    const quizId = typeof item.quiz === 'object' ? (item.quiz as any)._id : item.quiz;
                    return {
                        quiz: quizId,
                        order: item.order
                        // Explicitly NOT including _id here to avoid CastError
                    };
                })
            };
            
            await api.updateAdminExam(id, examData as any);
            toast.success("Exam saved successfully");
        } catch (error) {
            console.error("Error saving exam:", error);
            toast.error("Failed to save exam");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddQuiz = () => {
        if (!selectedQuizId || !exam) return;
        
        // Check if already added
        if (exam.quizzes.some(q => (typeof q.quiz === 'string' ? q.quiz : q.quiz._id) === selectedQuizId)) {
            toast.error("Quiz already added to this exam");
            return;
        }

        const quizToAdd = allQuizzes.find(q => q._id === selectedQuizId);
        if (!quizToAdd) return;

        const newQuizzes = [
            ...exam.quizzes,
            {
                quiz: quizToAdd, // Temporarily use full object for display, backend handles ID
                order: exam.quizzes.length,
                _id: "temp_" + Date.now()
            }
        ];
        
        // Update local state
        setExam({ ...exam, quizzes: newQuizzes });
        setSelectedQuizId("");
    };

    const handleRemoveQuiz = (index: number) => {
        if (!exam) return;
        const newQuizzes = [...exam.quizzes];
        newQuizzes.splice(index, 1);
        setExam({ ...exam, quizzes: newQuizzes });
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!exam) return <div className="p-8">Exam not found</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/admin/exams")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave()} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    <Button onClick={() => {
                        if (!exam) return;
                        const updatedExam: ExamModel = { ...exam, status: 'published' };
                        setExam(updatedExam);
                        handleSave(updatedExam);
                    }} disabled={isSaving || exam.status === 'published'}>
                        {exam.status === 'published' ? 'Published' : 'Publish Exam'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Exam Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={exam.title}
                                    onChange={(e) => setExam({ ...exam, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={exam.description}
                                    onChange={(e) => setExam({ ...exam, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Quizzes in this Exam</CardTitle>
                                <Badge variant="secondary">{exam.quizzes.length} Quizzes</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select a quiz to add..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allQuizzes.map(q => (
                                            <SelectItem key={q._id} value={q._id}>
                                                {q.title} ({q.totalQuestions} Qs)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleAddQuiz} disabled={!selectedQuizId}>
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                </Button>
                            </div>

                            <div className="space-y-2 mt-4">
                                {exam.quizzes.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                                        No quizzes added yet. Add quizzes from the dropdown above.
                                    </p>
                                ) : (
                                    exam.quizzes.map((item, index) => {
                                        const quiz = typeof item.quiz === 'object' ? item.quiz : allQuizzes.find(q => q._id === item.quiz);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-50" />
                                                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                                                        {index + 1}
                                                    </Badge>
                                                    <div>
                                                        <p className="font-medium">{quiz?.title || 'Unknown Quiz'}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {quiz?.totalQuestions || 0} Questions • {(quiz as any)?.duration || 0} mins
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveQuiz(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Price</Label>
                                <Input
                                    type="number"
                                    value={exam.price}
                                    onChange={(e) => setExam({ ...exam, price: parseFloat(e.target.value) })}
                                />
                                <p className="text-xs text-muted-foreground">Set to 0 for free access</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Passing Percentage</Label>
                                <Input
                                    type="number"
                                    value={exam.passResult}
                                    onChange={(e) => setExam({ ...exam, passResult: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Duration (min)</Label>
                                <Input
                                    type="number"
                                    value={exam.duration}
                                    onChange={(e) => setExam({ ...exam, duration: parseFloat(e.target.value) })}
                                />
                                <p className="text-xs text-muted-foreground">Override auto-calculated duration</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
