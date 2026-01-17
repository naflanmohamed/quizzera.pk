import { useState, useEffect } from "react";
import { api, Quiz, Category } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MoreVertical, Edit, Eye } from "lucide-react";
import Papa from "papaparse";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Quiz State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ 
    title: "", 
    description: "", 
    category: "", 
    difficulty: "medium", 
    duration: 30, // Default 30 mins
    passingScore: 40,
    appearedIn: "",
    customAuthor: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Import State
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Template Download
  const handleDownloadTemplate = () => {
    const csvContent = "Question Text,Option 1,Option 2,Option 3,Option 4,Correct Option (1-4),Explanation,Marks,Difficulty\n" +
                       "What is the capital of France?,Paris,London,Berlin,Madrid,1,Paris is the capital.,1,easy\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "quiz_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = async () => {
     if(!importFile || !newQuiz.title || !newQuiz.category || !newQuiz.description) {
        toast.error("Please provide Title, Description, Category and CSV file");
        return;
     }

     setIsSubmitting(true);
     
     // 1. Parse CSV first to ensure valid
     Papa.parse(importFile, {
         header: true,
         skipEmptyLines: true,
         complete: async (results) => {
             try {
                const parsedQuestions: any[] = [];
                // Basic validation loop
                for (let i = 0; i < results.data.length; i++) {
                     const row: any = results.data[i];
                     if (!row['Question Text'] || !row['Correct Option (1-4)']) continue;

                     const options = [
                         { text: row['Option 1'] || "", isCorrect: false, id: "1" },
                         { text: row['Option 2'] || "", isCorrect: false, id: "2" },
                         { text: row['Option 3'] || "", isCorrect: false, id: "3" },
                         { text: row['Option 4'] || "", isCorrect: false, id: "4" }
                     ].filter(o => o.text.trim() !== "");

                     if(options.length < 2) continue;

                     const correctIndices = row['Correct Option (1-4)'].toString().split('|').map((s: string) => s.trim());
                     options.forEach((opt, idx) => {
                        if (correctIndices.includes((idx + 1).toString())) opt.isCorrect = true;
                     });

                     parsedQuestions.push({
                        question: row['Question Text'],
                        questionType: correctIndices.length > 1 ? 'multiple' : 'single',
                        options: options,
                        correctAnswers: options.filter(o => o.isCorrect).map(o => o.id),
                        explanation: row['Explanation'] || "",
                        marks: parseInt(row['Marks']) || 1,
                        difficulty: row['Difficulty']?.toLowerCase() || 'medium'
                     });
                }
                
                if (parsedQuestions.length === 0) {
                    toast.error("No valid questions found in CSV");
                    setIsSubmitting(false);
                    return;
                }

                // 2. Create Quiz
                const createdQuiz = await api.createQuiz({
                    ...newQuiz,
                    totalQuestions: parsedQuestions.length,
                    status: 'published'
                } as any);

                // 3. Bulk Add Questions
                await api.bulkCreateQuestions(createdQuiz._id, parsedQuestions.map(q => ({...q, quiz: createdQuiz._id})));

                toast.success(`Quiz created with ${parsedQuestions.length} questions!`);
                setIsImportDialogOpen(false);
                setImportFile(null);
                setNewQuiz({ 
                    title: "", description: "", category: "", difficulty: "medium", duration: 30, passingScore: 40, appearedIn: "", customAuthor: ""
                });
                fetchData();

             } catch (error) {
                 console.error(error);
                 toast.error("Failed to import quiz");
             } finally {
                 setIsSubmitting(false);
             }
         },
         error: (err) => {
             console.error(err);
             toast.error("Failed to parse CSV");
             setIsSubmitting(false);
         }
     });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quizzesData, categoriesData] = await Promise.all([
        api.getQuizzes(),
        api.getCategories()
      ]);
      setQuizzes(quizzesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.title || !newQuiz.category || !newQuiz.duration || !newQuiz.passingScore) {
       toast.error("Please fill in required fields");
       return;
    }

    setIsSubmitting(true);
    try {
      const createdQuiz = await api.createQuiz(newQuiz as any);
      toast.success("Quiz created successfully");
      setIsDialogOpen(false);
      
      // Reset form
      setNewQuiz({ 
        title: "", 
        description: "", 
        category: "", 
        difficulty: "medium", 
        duration: 30,
        passingScore: 40,
        appearedIn: "",
        customAuthor: ""
      });
      
      fetchData();
      
      // Optional: Navigate to editor immediately
      if(confirm("Quiz created! Do you want to add questions now?")) {
          navigate(`/admin/quizzes/${createdQuiz._id}`);
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      await api.deleteQuiz(id);
      toast.success("Quiz deleted");
      fetchData();
    } catch (error) {
      console.error("Delete quiz error:", error);
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">Manage quizzes and tests.</p>
        </div>
        
        <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Import Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import Quiz from CSV</DialogTitle>
                  <DialogDescription>
                    Create a new quiz and import questions from a CSV file.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                   <div className="space-y-2">
                     <Label>Quiz Title</Label>
                     <Input 
                        value={newQuiz.title} 
                        onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                        placeholder="e.g. JavaScript Final Exam"
                     />
                   </div>
                   
                   <div className="space-y-2">
                     <Label>Description</Label>
                     <Textarea 
                        value={newQuiz.description} 
                        onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                        placeholder="Enter quiz description..."
                        required
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Appeared In</Label>
                       <Input 
                          value={(newQuiz as any).appearedIn} 
                          onChange={(e) => setNewQuiz({...newQuiz, appearedIn: e.target.value})}
                          placeholder="e.g. PPSC 2021"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label>Who Added</Label>
                       <Input 
                          value={(newQuiz as any).customAuthor} 
                          onChange={(e) => setNewQuiz({...newQuiz, customAuthor: e.target.value})}
                          placeholder="e.g. Ali Khan"
                       />
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Duration (min)</Label>
                       <Input 
                          type="number"
                          value={newQuiz.duration} 
                          onChange={(e) => setNewQuiz({...newQuiz, duration: parseInt(e.target.value) || 0})}
                          placeholder="e.g. 30"
                          min="1"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label>Passing Score (%)</Label>
                       <Input 
                          type="number"
                          value={newQuiz.passingScore} 
                          onChange={(e) => setNewQuiz({...newQuiz, passingScore: parseInt(e.target.value) || 0})}
                          placeholder="e.g. 40"
                          min="0"
                          max="100"
                       />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                         <Select value={newQuiz.category} onValueChange={v => setNewQuiz({...newQuiz, category: v})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label>Difficulty</Label>
                         <Select value={newQuiz.difficulty} onValueChange={v => setNewQuiz({...newQuiz, difficulty: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {['easy', 'medium', 'hard'].map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <Label>CSV File</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2">
                          <Plus className="w-8 h-8 text-muted-foreground" />
                          <p className="text-sm font-medium">Drag & drop or Click to Upload</p>
                          <Input 
                            type="file" 
                            accept=".csv"
                            className="hidden" 
                            id="quiz-import-upload"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                          />
                          <Button variant="secondary" size="sm" onClick={() => document.getElementById('quiz-import-upload')?.click()}>
                              {importFile ? importFile.name : 'Select CSV File'}
                          </Button>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                          <span className="text-xs text-muted-foreground">Required columns: Question Text, Correct Option (1-4), Options...</span>
                          <Button variant="link" size="sm" className="h-auto p-0" onClick={handleDownloadTemplate}>
                              Download Template
                          </Button>
                      </div>
                   </div>
                </div>
                <DialogFooter>
                   <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                   <Button onClick={handleImportSubmit} disabled={isSubmitting || !importFile || !newQuiz.title}>
                      {isSubmitting ? 'Importing...' : 'Create & Import'}
                   </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Quiz</DialogTitle>
                  <DialogDescription>
                    Initialize a new quiz. You can add questions after creating it.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                     <Select 
                        value={newQuiz.category} 
                        onValueChange={(value) => setNewQuiz({ ...newQuiz, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                         <Select 
                            value={newQuiz.difficulty} 
                            onValueChange={(value) => setNewQuiz({ ...newQuiz, difficulty: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                     </div>
                     
                     <div className="space-y-2">
                        <Label htmlFor="duration">Duration (min)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          value={newQuiz.duration}
                          onChange={(e) => setNewQuiz({ ...newQuiz, duration: parseInt(e.target.value) })}
                          required
                        />
                     </div>
                  </div>
                  
                 <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="1"
                      max="100"
                      value={newQuiz.passingScore}
                      onChange={(e) => setNewQuiz({ ...newQuiz, passingScore: parseInt(e.target.value) })}
                      required
                    />
                 </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                      placeholder="Enter a brief description..."
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Quiz"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Appeared In</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-6 w-40 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted/50 rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No quizzes found.
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => (
                <TableRow key={quiz._id}>
                  <TableCell className="font-medium">
                    {quiz.title}
                    <div className="text-xs text-muted-foreground hidden sm:block truncate max-w-[200px]">
                      {quiz.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {typeof quiz.category === 'object' ? quiz.category.name : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {(quiz as any).customAuthor || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {(quiz as any).appearedIn || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>
                      {quiz.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(quiz.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(quiz._id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
