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
    passingScore: 40 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        passingScore: 40
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
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
