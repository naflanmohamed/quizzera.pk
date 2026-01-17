import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, Quiz, Category, Question } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, FileUp, Download } from "lucide-react";
import Papa from "papaparse";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminQuizEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  
  // Question Form State
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isCSVDialogOpen, setIsCSVDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, "_id" | "quiz" | "order">>({
    question: "",
    questionType: "single",
    marks: 1,
    negativeMarks: 0,
    difficulty: "medium",
    // 4 Default Options
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ]
  });

  const fetchQuizData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [quizData, questionsData, categoriesData] = await Promise.all([
        api.getQuizById(id),
        api.getQuestions(id),
        api.getCategories()
      ]);
      setQuiz(quizData);
      setQuestions(questionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load quiz data:", error);
      toast.error("Failed to load quiz details");
      navigate("/admin/quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || !id) return;
    try {
      await api.updateQuiz(id, {
        title: quiz.title,
        description: quiz.description,
        category: typeof quiz.category === 'object' ? quiz.category._id : quiz.category,
        difficulty: quiz.difficulty,
        duration: quiz.duration,
        passingScore: quiz.passingScore,
        isPremium: quiz.isPremium,
        appearedIn: quiz.appearedIn,
        customAuthor: quiz.customAuthor
      });
      toast.success("Quiz updated details saved");
    } catch{
      toast.error("Failed to update quiz");
    }
  };

  const handleAddQuestion = async () => {
    if (!id) return;
    
    // Validation
    if (!newQuestion.question) {
      toast.error("Question text is required");
      return;
    }
    const filledOptions = newQuestion.options.filter(o => o.text.trim().length > 0);
    if (filledOptions.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }
    if (!filledOptions.some(o => o.isCorrect)) {
      toast.error("Select at least one correct answer");
      return;
    }

    try {
      await api.createQuestion(id, {
        ...newQuestion,
        options: filledOptions // Only send filled options
      });
      toast.success("Question added");
      setIsQuestionDialogOpen(false);
      
      // Reset form
      setNewQuestion({
        question: "",
        questionType: "single",
        marks: 1,
        negativeMarks: 0,
        difficulty: "medium",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ]
      });
      
      // Refresh questions
      const qs = await api.getQuestions(id);
      setQuestions(qs);
    } catch (error) {
      toast.error("Failed to add question");
      console.error(error);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if(!confirm("Delete this question?")) return;
    try {
      await api.deleteQuestion(qId);
      toast.success("Question deleted");
      const qs = await api.getQuestions(id!);
      setQuestions(qs);
    } catch{
      toast.error("Failed to delete question");
    }
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: any) => {
    const updatedOptions = [...newQuestion.options];
    if (field === 'isCorrect' && newQuestion.questionType === 'single') {
        // If single choice, uncheck others
        updatedOptions.forEach(op => op.isCorrect = false);
    }
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Question Text,Option 1,Option 2,Option 3,Option 4,Correct Option (1-4),Explanation,Marks,Difficulty\n" +
                       "What is the capital of France?,Paris,London,Berlin,Madrid,1,Paris is the capital.,1,easy\n" + 
                       "Which are programming languages?,Python,HTML,Java,Banana,1|3,Python and Java are languages.,2,medium";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "quiz_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            try {
                const parsedQuestions: any[] = [];
                const errors: string[] = [];

                for (let i = 0; i < results.data.length; i++) {
                    const row: any = results.data[i];
                    // Basic validation
                    if (!row['Question Text'] || !row['Correct Option (1-4)']) {
                        errors.push(`Row ${i + 2}: Missing Question or Correct Option`);
                        continue;
                    }

                    const options = [
                        { text: row['Option 1'] || "", isCorrect: false, id: "1" },
                        { text: row['Option 2'] || "", isCorrect: false, id: "2" },
                        { text: row['Option 3'] || "", isCorrect: false, id: "3" },
                        { text: row['Option 4'] || "", isCorrect: false, id: "4" }
                    ].filter(o => o.text.trim() !== "");

                    if (options.length < 2) {
                        errors.push(`Row ${i + 2}: At least 2 options required`);
                        continue;
                    }

                    const correctIndices = row['Correct Option (1-4)'].toString().split('|').map((s: string) => s.trim());
                    
                    let hasCorrect = false;
                    options.forEach((opt, idx) => {
                       if (correctIndices.includes((idx + 1).toString())) {
                           opt.isCorrect = true;
                           hasCorrect = true;
                       }
                    });

                    if (!hasCorrect) {
                         errors.push(`Row ${i + 2}: Invalid Correct Option (must match 1-4)`);
                         continue;
                    }

                    parsedQuestions.push({
                        question: row['Question Text'],
                        questionType: correctIndices.length > 1 ? 'multiple' : 'single',
                        options: options,
                        correctAnswers: options.filter(o => o.isCorrect).map(o => o.id), // Add correctAnswers for backend
                        explanation: row['Explanation'] || "",
                        marks: parseInt(row['Marks']) || 1,
                        difficulty: row['Difficulty']?.toLowerCase() || 'medium',
                        quiz: id 
                    });
                }

                if (errors.length > 0) {
                    toast.error(`Found errors in CSV: \n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '...' : ''}`);
                    if(parsedQuestions.length === 0) return; // Stop if nothing valid
                }

                if (parsedQuestions.length > 0) {
                    await api.bulkCreateQuestions(id!, parsedQuestions);
                    toast.success(`Successfully imported ${parsedQuestions.length} questions`);
                    const qs = await api.getQuestions(id!);
                    setQuestions(qs);
                    setIsCSVDialogOpen(false);
                }

            } catch (err) {
                console.error("CSV Import Error:", err);
                toast.error("Failed to process CSV file");
            } finally {
                setIsImporting(false);
                // Reset file input
                e.target.value = '';
            }
        },
        error: (err) => {
            console.error("Papa Parse Error:", err);
            toast.error("Failed to parse CSV file");
            setIsImporting(false);
        }
    });
  };

  if (isLoading || !quiz) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/quizzes")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Edit Quiz: {quiz.title}</h1>
           <div className="flex gap-2 text-sm text-muted-foreground">
             <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>{quiz.status}</Badge>
             <span>{questions.length} Questions</span>
           </div>
        </div>
        <div className="ml-auto flex gap-2">
            {quiz.status !== 'published' && (
              <Button onClick={async () => {
                if(!confirm("Are you sure you want to publish this quiz? It will be visible to all students.")) return;
                try {
                  await api.publishQuiz(id!);
                  toast.success("Quiz Published Successfully!");
                  setQuiz({...quiz, status: 'published'});
                } catch {
                  toast.error("Failed to publish quiz");
                }
              }}>
                Publish Quiz
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quiz Details Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="quiz-form" onSubmit={handleUpdateQuiz} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={quiz.title} onChange={e => setQuiz({...quiz, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={typeof quiz.category === 'object' ? quiz.category._id : quiz.category} 
                  onValueChange={v => setQuiz({...quiz, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={quiz.difficulty} onValueChange={(v: any) => setQuiz({...quiz, difficulty: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['easy', 'medium', 'hard'].map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input type="number" value={quiz.duration} onChange={e => setQuiz({...quiz, duration: parseInt(e.target.value)})} />
                 </div>
              </div>
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input type="number" value={quiz.passingScore} onChange={e => setQuiz({...quiz, passingScore: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                 <Label>Description</Label>
                 <Textarea value={quiz.description} onChange={e => setQuiz({...quiz, description: e.target.value})} />
              </div>

               <div className="pt-2">
                 <Dialog open={isCSVDialogOpen} onOpenChange={setIsCSVDialogOpen}>
                     <DialogTrigger asChild>
                         <Button type="button" variant="outline" className="w-full">
                           <FileUp className="w-4 h-4 mr-2"/> Import Questions from CSV
                         </Button>
                     </DialogTrigger>
                     <DialogContent>
                         <DialogHeader>
                             <DialogTitle>Import Questions from CSV</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                             <div className="text-sm text-muted-foreground">
                                 <p>Upload a CSV file to bulk import questions. The file must follow the specific template format.</p>
                             </div>
                             <div className="flex flex-col gap-2">
                                 <Button variant="secondary" onClick={handleDownloadTemplate} className="w-full">
                                     <Download className="w-4 h-4 mr-2" /> Download Template
                                 </Button>
                             </div>
                             <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-2">
                                 <FileUp className="w-8 h-8 text-muted-foreground" />
                                 <p className="text-sm font-medium">Drag & drop or Click to Upload</p>
                                 <Input 
                                    type="file" 
                                    accept=".csv"
                                    className="hidden" 
                                    id="csv-upload"
                                    onChange={handleCSVUpload}
                                    disabled={isImporting}
                                 />
                                 <Button disabled={isImporting} variant="default" onClick={() => document.getElementById('csv-upload')?.click()}>
                                     {isImporting ? 'Importing...' : 'Select CSV File'}
                                 </Button>
                             </div>
                         </div>
                     </DialogContent>
                 </Dialog>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Who added QUIZ</Label>
                     <Input 
                        placeholder="e.g. Mentor Name" 
                        value={quiz.customAuthor || ''} 
                        onChange={e => setQuiz({...quiz, customAuthor: e.target.value})} 
                     />
                  </div>
                  <div className="space-y-2">
                     <Label>Appeared In (Year/Exam)</Label>
                     <Input 
                        placeholder="e.g. PPSC 2021" 
                        value={quiz.appearedIn || ''} 
                        onChange={e => setQuiz({...quiz, appearedIn: e.target.value})} 
                     />
                  </div>
               </div>

              <div className="flex items-center space-x-2 pt-2">
                 <Switch checked={quiz.isPremium} onCheckedChange={c => setQuiz({...quiz, isPremium: c})} />
                 <Label>Premium Exclusive?</Label>
              </div>
              <Button type="submit" className="w-full">Save Details</Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Questions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
             <div className="flex gap-2">
                 {/* CSV Import removed from here */}

                 <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                   <DialogTrigger asChild>
                     <Button><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
                   </DialogTrigger>
               <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
                   <DialogTitle>Add New Question</DialogTitle>
                 </DialogHeader>
                 
                 <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea 
                          value={newQuestion.question} 
                          onChange={e => setNewQuestion({...newQuestion, question: e.target.value})} 
                          placeholder="What is 2 + 2?"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label>Type</Label>
                             <Select value={newQuestion.questionType} onValueChange={v => setNewQuestion({...newQuestion, questionType: v as "single" | "multiple"})}>
                               <SelectTrigger><SelectValue /></SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="single">Single Choice</SelectItem>
                                 <SelectItem value="multiple">Multiple Choice</SelectItem>
                               </SelectContent>
                             </Select>
                        </div>
                        <div className="space-y-2">
                             <Label>Marks</Label>
                             <Input type="number" value={newQuestion.marks} onChange={e => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Options (Check correct valid answers)</Label>
                        {newQuestion.options.map((opt, idx) => (
                           <div key={idx} className="flex gap-2 items-center">
                              <Button 
                                variant={opt.isCorrect ? "default" : "outline"} 
                                size="icon" 
                                className="shrink-0 h-10 w-10"
                                onClick={() => handleOptionChange(idx, 'isCorrect', !opt.isCorrect)}
                              >
                                {opt.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                              </Button>
                              <Input 
                                placeholder={`Option ${idx + 1}`}
                                value={opt.text}
                                onChange={e => handleOptionChange(idx, 'text', e.target.value)}
                              />
                           </div>
                        ))}
                    </div>
                 </div>

                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddQuestion}>Add Question</Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
          </div>
         </div>

          <div className="space-y-4">
             {questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    No questions yet. Add one to get started!
                </div>
             ) : (
                questions.map((q, idx) => (
                   <Card key={q._id}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="font-medium flex gap-2">
                           <span className="text-muted-foreground">#{idx + 1}</span>
                           <span>{q.question}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteQuestion(q._id)}>
                           <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                         <div className="grid grid-cols-2 gap-2 mt-2">
                             {q.options.map((opt, i) => (
                                <div key={i} className={`text-sm p-2 rounded border ${opt.isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/10' : 'bg-muted/30'}`}>
                                    {opt.text}
                                </div>
                             ))}
                         </div>
                      </CardContent>
                   </Card>
                ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
