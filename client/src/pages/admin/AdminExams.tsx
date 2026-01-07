import { useState, useEffect } from "react";
import { api, ExamModel } from "@/services/api";
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Exam State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({ 
    title: "", 
    description: "",
    price: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const data = await api.getExamsList();
      setExams(data.exams);
    } catch (error) {
      console.error("Failed to load exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title || !newExam.description) {
       toast.error("Please fill in required fields");
       return;
    }

    setIsSubmitting(true);
    try {
      const createdExam = await api.createAdminExam(newExam);
      toast.success("Exam created successfully");
      setIsDialogOpen(false);
      
      // Reset form
      setNewExam({ 
        title: "", 
        description: "",
        price: 0
      });
      
      fetchExams();
      
      if(confirm("Exam created! Do you want to add quizzes now?")) {
          navigate(`/admin/exams/${createdExam._id}`);
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    
    try {
      await api.deleteAdminExam(id);
      toast.success("Exam deleted");
      fetchExams();
    } catch (error) {
      console.error("Delete exam error:", error);
      toast.error("Failed to delete exam");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Manage exams and bundles.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Initialize a new exam container. You can add quizzes after creating it.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newExam.description}
                  onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  placeholder="Enter a brief description..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (Leave 0 for free)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={newExam.price}
                  onChange={(e) => setNewExam({ ...newExam, price: parseFloat(e.target.value) })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Exam"}
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
              <TableHead>Quizzes</TableHead>
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
                  <TableCell><div className="h-6 w-16 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted/50 rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No exams found.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell className="font-medium">
                    {exam.title}
                    <div className="text-xs text-muted-foreground hidden sm:block truncate max-w-[200px]">
                      {exam.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    {exam.quizzes?.length || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
                      {exam.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(exam.createdAt), "MMM d, yyyy")}
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
                        <DropdownMenuItem onClick={() => navigate(`/admin/exams/${exam._id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(exam._id)}>
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
