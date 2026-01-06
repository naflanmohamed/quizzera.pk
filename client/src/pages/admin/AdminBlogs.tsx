import { useState, useEffect } from "react";
import { api, Blog } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, MoreVertical, Edit, Search } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "other",
    featuredImage: "",
    tags: "",
    status: "draft" as "draft" | "published" | "archived"
  });

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBlogs({ search: searchQuery });
      setBlogs(data.blogs);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBlogs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "other",
      featuredImage: "",
      tags: "",
      status: "draft"
    });
    setIsEditing(false);
    setCurrentBlogId(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content || "", // Content might be excluded in list view, handle appropriately if needed
      category: blog.category,
      featuredImage: blog.featuredImage || "",
      tags: blog.tags.join(", "),
      status: blog.status
    });
    setCurrentBlogId(blog._id);
    setIsEditing(true);
    setIsDialogOpen(true);
    
    // If content is missing (excluded in list), fetch full details
    if (!blog.content) {
      api.getBlogById(blog._id).then(fullBlog => {
        setFormData(prev => ({ ...prev, content: fullBlog.content }));
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t)
      };

      if (isEditing && currentBlogId) {
        await api.updateBlog(currentBlogId, payload);
        toast.success("Blog updated successfully");
      } else {
        await api.createBlog(payload);
        toast.success("Blog created successfully");
      }
      setIsDialogOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to save blog:", error);
      toast.error(isEditing ? "Failed to update blog" : "Failed to create blog");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      await api.deleteBlog(id);
      toast.success("Blog deleted");
      fetchBlogs();
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
          <p className="text-muted-foreground">Manage blog posts.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search blogs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
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
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No blogs found.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell className="font-medium">
                    {blog.title}
                    {blog.category && <Badge variant="outline" className="ml-2 text-xs">{blog.category}</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {typeof blog.author === 'object' ? blog.author.name : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(blog.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(blog)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(blog._id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Blog Post" : "Create Blog Post"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update existing blog post details." : "Add a new blog post to the platform."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam_tips">Exam Tips</SelectItem>
                  <SelectItem value="study_strategies">Study Strategies</SelectItem>
                  <SelectItem value="current_affairs">Current Affairs</SelectItem>
                  <SelectItem value="success_stories">Success Stories</SelectItem>
                  <SelectItem value="exam_updates">Exam Updates</SelectItem>
                  <SelectItem value="career_guidance">Career Guidance</SelectItem>
                  <SelectItem value="subject_guide">Subject Guide</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Featured Image URL</Label>
                <Input 
                  id="image" 
                  value={formData.featuredImage} 
                  onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input 
                id="tags" 
                value={formData.tags} 
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="exam, study, tips"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt (Short Summary)</Label>
              <Textarea 
                id="excerpt" 
                value={formData.excerpt} 
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                required 
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required 
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Markdown formatting supported.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Post" : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
