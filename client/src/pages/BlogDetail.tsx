import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Clock, 
  Eye, 
  Heart,
  Share2,
  ArrowLeft,
  User,
  ChevronLeft
} from "lucide-react";
import { api, Blog } from "@/services/api";
import {Navbar} from "@/components/layout/Navbar";
import {Footer} from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const blogData = await api.getBlogBySlug(slug!);
        setBlog(blogData);
        setIsLiked(!!blogData.isLiked); // Set initial like status from server
        
        // Fetch related posts
        const { blogs } = await api.getBlogs({ 
          category: blogData.category, 
          limit: 3 
        });
        setRelatedPosts(blogs.filter(b => b._id !== blogData._id).slice(0, 3));
      } catch {
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug, toast]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    if (!blog) return;
    
    // Check if user is logged in (you might want to use your auth context here)
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to like this post",
        variant: "destructive",
      });
      // Optionally redirect to login
      // window.location.href = "/login"; 
      return;
    }

    try {
      const response = await api.likeBlog(blog._id);
      setIsLiked(response.isLiked);
      setBlog({ ...blog, likeCount: response.likeCount });
      
      if (response.isLiked) {
        toast({ title: "Thanks for your support!" });
      } else {
        toast({ title: "Removed like" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: blog?.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[128px]" />
      </div>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <Navbar />
      
      <div className="relative z-10 container mx-auto px-4 py-10 max-w-7xl">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center mr-3 group-hover:border-primary/50 transition-colors shadow-sm">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span className="font-medium">Back to Articles</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-[60px_1fr_320px] gap-8 lg:gap-12">
          
          {/* LEFT: Sticky Social Actions (Desktop) */}
          <div className="hidden lg:flex flex-col gap-6 sticky top-32 h-fit items-center">
             <Button
                variant={isLiked ? "default" : "secondary"}
                size="icon"
                onClick={handleLike}
                disabled={isLiked}
                className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${isLiked ? 'opacity-100 scale-110' : 'opacity-80 hover:opacity-100 hover:scale-110'}`}
                title="Like this article"
             >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
             </Button>
             <span className="text-xs font-medium text-muted-foreground -mt-3">{blog.likeCount}</span>

             <div className="w-8 h-[1px] bg-border" />

             <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="w-12 h-12 rounded-full shadow-md bg-background hover:bg-muted hover:text-primary transition-all duration-300 hover:scale-110"
                title="Share this article"
             >
                <Share2 className="h-5 w-5" />
             </Button>
          </div>

          {/* MAIN CONTENT */}
          <article className="min-w-0">
             {/* Header */}
            <header className="mb-10 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1 text-sm font-medium">
                  {blog.category}
                </Badge>
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-muted-foreground/80 font-normal">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-[1.15] tracking-tight text-foreground">
                {blog.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 py-6 border-y border-dashed text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                     <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                     </div>
                  </div>
                  <div className="text-left">
                     <p className="font-semibold text-foreground text-sm">
                        {typeof blog.author === 'object' ? blog.author.name : 'Author'}
                     </p>
                     <p className="text-xs opacity-80">Content Creator</p>
                  </div>
                </div>
                
                <div className="hidden sm:block w-[1px] h-8 bg-border" />

                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        {format(new Date(blog.publishedAt || blog.createdAt), "MMM dd, yyyy")}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/70" />
                        {blog.readingTime} min read
                    </span>
                    <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary/70" />
                        {blog.viewCount} views
                    </span>
                 </div>
              </div>
            </header>

            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border bg-muted aspect-[16/9] relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-10" />
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            )}

            {/* Content Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none
                leading-loose
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50
                prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
                prose-p:text-muted-foreground/90 prose-p:mb-8 prose-p:text-lg
                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-accent transition-colors
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/5 prose-blockquote:to-transparent prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-lg prose-blockquote:font-medium prose-blockquote:text-foreground prose-blockquote:my-10 prose-blockquote:shadow-sm
                prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:my-10
                prose-strong:text-foreground prose-strong:font-bold
                prose-code:bg-muted prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none
                prose-ul:my-8 prose-li:my-3 prose-li:marker:text-primary
                first-letter:text-6xl first-letter:font-black first-letter:text-primary first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:leading-none
                mb-16"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Mobile Actions (Bottom Bar) */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-lg border rounded-full shadow-xl">
               <Button
                  variant={isLiked ? "default" : "ghost"}
                  size="sm"
                  onClick={handleLike}
                  className="rounded-full"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {blog.likeCount}
                </Button>
                <div className="w-[1px] h-4 bg-border" />
                <Button variant="ghost" size="sm" onClick={handleShare} className="rounded-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
            </div>

            {/* Detailed Author Bio Box at End */}
             <div className="bg-muted/30 rounded-2xl p-8 border border-border/50 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent p-[2px] shrink-0">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                       <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                </div>
                <div>
                   <h3 className="font-bold text-lg mb-2 text-foreground">Written by {typeof blog.author === 'object' ? blog.author.name : 'The Author'}</h3>
                   <p className="text-muted-foreground leading-relaxed mb-4">
                      Passionate about education and helping students succeed. Creating in-depth guides and study resources for Quizzera.
                   </p>
                   {/* Placeholder for author links */}
                   <div className="flex items-center justify-center md:justify-start gap-4">
                      <Button variant="link" className="px-0 h-auto text-primary">View Profile</Button> 
                      <Button variant="link" className="px-0 h-auto text-primary">More Articles</Button>
                   </div>
                </div>
             </div>
          </article>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-1">
             <div className="lg:sticky lg:top-32 space-y-8">
               {/* Newsletter / CTA Card */}
               <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl" />
                  
                  <CardContent className="pt-8 pb-8 relative z-10 text-center">
                    <div className="mb-4 inline-flex p-3 rounded-full bg-white/10">
                       <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Weekly Study Tips</h3>
                    <p className="text-primary-foreground/90 text-sm mb-6 leading-relaxed">
                      Join 10,000+ students getting free exam strategies delivered to their inbox.
                    </p>
                    <div className="space-y-3">
                        <input 
                           type="email" 
                           placeholder="Your email address" 
                           className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                        />
                        <Button variant="secondary" className="w-full font-bold shadow-md hover:shadow-lg transition-all">
                        Subscribe Free
                        </Button>
                    </div>
                  </CardContent>
               </Card>

               {/* Related Posts */}
               {relatedPosts.length > 0 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b">
                     Read Next
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((post) => (
                      <Link key={post._id} to={`/blog/${post.slug}`} className="block group">
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-muted group-hover:border-primary/20 bg-card">
                          <div className="flex gap-4 p-4">
                            {post.featuredImage && (
                              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 className="font-bold text-sm line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
                                {post.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                 <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.readingTime} min
                                 </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
               )}
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;
