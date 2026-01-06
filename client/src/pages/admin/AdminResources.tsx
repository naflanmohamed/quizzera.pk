import { useState, useEffect } from "react";
import { api, PdfResource, Category } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MoreVertical, Edit, FileText } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminResources() {
  const [pdfs, setPdfs] = useState<PdfResource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPdf, setNewPdf] = useState({ 
    title: "", 
    description: "", 
    category: "", 
    resourceType: "past_paper",
    fileUrl: "",
    originalName: "",
    year: new Date().getFullYear(),
    isPremium: false,
    fileSize: 1024 * 1024 // Default 1MB dummy size
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // null = use URL, File object = use file upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pdfsData, categoriesData] = await Promise.all([
        api.getPdfs(),
        api.getCategories()
      ]);
      setPdfs(pdfsData.pdfs);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load resources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      await api.deletePdf(id);
      toast.success("Resource deleted");
      fetchData();
    } catch (error) {
      console.error("Delete resource error:", error);
      toast.error("Failed to delete resource");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPdf.title || !newPdf.category || !newPdf.description) {
       toast.error("Please fill in required fields");
       return;
    }

    if (uploadFile === null && !newPdf.fileUrl) {
       toast.error("Please provide a file URL");
       return;
    }
    
    // Check if uploadFile is selected but empty (user switched to upload mode but didn't pick file)
    if (uploadFile !== null && (!uploadFile.name || uploadFile.size === 0)) {
       toast.error("Please select a valid file");
       return;
    }

    setIsSubmitting(true);
    try {
      let submitData: any;

      if (uploadFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('title', newPdf.title);
        formData.append('description', newPdf.description);
        formData.append('category', newPdf.category);
        formData.append('resourceType', newPdf.resourceType);
        formData.append('year', newPdf.year.toString());
        formData.append('isPremium', String(newPdf.isPremium));
        formData.append('file', uploadFile); // Append file
        
        submitData = formData;
      } else {
        // Use JSON for URL
        submitData = {
           ...newPdf,
           originalName: newPdf.originalName || newPdf.fileUrl.split('/').pop() || 'resource.pdf',
           fileSize: 0 // Default size for external links
        };
      }
      
      await api.createPdf(submitData);

      toast.success("Resource created successfully");
      setIsDialogOpen(false);
      setNewPdf({ 
        title: "", 
        description: "", 
        category: "", 
        resourceType: "past_paper",
        fileUrl: "",
        originalName: "",
        year: new Date().getFullYear(),
        isPremium: false,
        fileSize: 1024 * 1024
      });
      fetchData();
    } catch (error) {
      console.error("Create resource error:", error);
      toast.error("Failed to create resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">Manage PDF resources.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Resource</DialogTitle>
              <DialogDescription>
                Add a new PDF resource.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPdf.title}
                    onChange={(e) => setNewPdf({ ...newPdf, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                   <Select 
                      value={newPdf.category} 
                      onValueChange={(value) => setNewPdf({ ...newPdf, category: value })}
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
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                     <Select 
                        value={newPdf.resourceType} 
                        onValueChange={(value) => setNewPdf({ ...newPdf, resourceType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="past_paper">Past Paper</SelectItem>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="syllabus">Syllabus</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="formula_sheet">Formula Sheet</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newPdf.year}
                      onChange={(e) => setNewPdf({ ...newPdf, year: parseInt(e.target.value) })}
                    />
                 </div>
               </div>
               
              <div className="space-y-2">
                <Label htmlFor="description">Description (Required)</Label>
                <Input
                  id="description"
                  value={newPdf.description}
                  onChange={(e) => setNewPdf({ ...newPdf, description: e.target.value })}
                  required
                />
              </div>

              {/* Upload Switch */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                 <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant={!uploadFile ? "default" : "outline"} 
                      onClick={() => setUploadFile(null)}
                      className="flex-1"
                    >
                        Use URL
                    </Button>
                    <Button 
                      type="button" 
                      variant={uploadFile !== null ? "default" : "outline"} 
                      onClick={() => setUploadFile(new File([], ""))}
                      className="flex-1"
                    >
                        Upload File
                    </Button>
                 </div>

                 {uploadFile !== null ? (
                    <div className="space-y-2">
                        <Label>Upload PDF</Label>
                        <Input 
                            type="file" 
                            accept="application/pdf"
                            onChange={(e) => {
                                if(e.target.files?.[0]) {
                                    setUploadFile(e.target.files[0]);
                                }
                            }}
                        />
                        <p className="text-xs text-muted-foreground">Max size: 10MB. PDF only.</p>
                    </div>
                 ) : (
                    <div className="space-y-2">
                        <Label htmlFor="fileUrl">File URL (Direct Link)</Label>
                        <Input
                        id="fileUrl"
                        placeholder="https://example.com/file.pdf"
                        value={newPdf.fileUrl}
                        onChange={(e) => setNewPdf({ ...newPdf, fileUrl: e.target.value })}
                        required={uploadFile === null}
                        />
                    </div>
                 )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                    id="premium" 
                    checked={newPdf.isPremium} 
                    onCheckedChange={(checked) => setNewPdf({ ...newPdf, isPremium: !!checked })} 
                />
                <Label htmlFor="premium">Premium Content?</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Resource"}
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
              <TableHead>Type</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-6 w-40 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted/50 rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : pdfs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No resources found.
                </TableCell>
              </TableRow>
            ) : (
              pdfs.map((pdf) => (
                <TableRow key={pdf._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {pdf.title}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{pdf.resourceType.replace('_', ' ')}</TableCell>
                  <TableCell>
                    {pdf.isPremium ? (
                      <Badge variant="default" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">Premium</Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(pdf.createdAt), "MMM d, yyyy")}
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
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(pdf._id)}>
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
