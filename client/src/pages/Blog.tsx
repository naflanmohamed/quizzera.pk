import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  Heart,
  TrendingUp,
  Bookmark
} from "lucide-react";
import { api, Blog as BlogType } from "@/services/api";
import {Navbar} from "@/components/layout/Navbar";
import {Footer} from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Blog = () => {
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogType[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<BlogType[]>([]);
  const [tags, setTags] = useState<{ _id: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [blogsData, featuredData, trendingData, tagsData] = await Promise.all([
          api.getBlogs({ tag: selectedTag || undefined, status: "published" }),
          api.getFeaturedBlogs(3),
          api.getTrendingBlogs(5),
          api.getBlogTags(),
        ]);
        setBlogs(blogsData.blogs);
        setFeaturedBlogs(featuredData);
        setTrendingBlogs(trendingData);
        setTags(tagsData);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load blog posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTag, toast]);

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -ml-32 -mb-32" />
      </div>

      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10" />
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0 px-4 py-1.5 text-sm">
             Knowledge Hub
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Blog & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
            Expert tips, study strategies, and exam insights to help you ace your path to success.
          </p>
          
          {/* Search Bar Floating */}
          <div className="max-w-md mx-auto relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/30 transition-all duration-300" />
            <div className="relative bg-card rounded-full shadow-lg border border-border/50 flex items-center p-1.5 transition-transform group-hover:-translate-y-0.5">
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 bg-transparent py-2 px-3 text-base"
              />
              {searchQuery && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSearchQuery("")}
                  className="h-8 w-8 p-0 rounded-full mr-1 hover:bg-muted"
                >
                  <span className="sr-only">Clear</span>
                  &times;
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Main Content */}
          <div>
            {/* Featured Posts */}
            {!searchQuery && featuredBlogs.length > 0 && !selectedTag && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-primary" />
                    Featured
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isLoading ? (
                    [...Array(2)].map((_, i) => (
                      <Card key={i} className="border-0 shadow-none bg-muted/40">
                        <Skeleton className="h-56 w-full rounded-xl" />
                        <CardContent className="pt-4 px-1">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    featuredBlogs.slice(0, 2).map((blog) => (
                      <Link key={blog._id} to={`/blog/${blog.slug}`} className="group block h-full">
                        <div className="relative h-full rounded-2xl overflow-hidden bg-card border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                          <div className="aspect-[16/10] overflow-hidden relative">
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                            {blog.featuredImage ? (
                                <img
                                  src={blog.featuredImage}
                                  alt={blog.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <Bookmark className="h-12 w-12 opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 z-20">
                               <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 shadow-sm hover:bg-background">
                                   {blog.category}
                               </Badge>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-medium">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(blog.publishedAt || blog.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {blog.readingTime} min read
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-xl mb-3 leading-tight group-hover:text-primary transition-colors">
                              {blog.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {blog.excerpt}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold">
                    {searchQuery ? `Results for "${searchQuery}"` : selectedTag ? `Tag: #${selectedTag}` : "Latest Articles"}
                 </h2>
                 {(selectedTag || searchQuery) && (
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setSelectedTag(null); setSearchQuery(""); }}
                        className="text-muted-foreground hover:text-foreground"
                     >
                         Clear Filters
                     </Button>
                 )}
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-32 w-48 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredBlogs.length === 0 ? (
                <Card className="p-16 text-center border-dashed bg-muted/30">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                     <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    We couldn't find any articles matching your search criteria. Try different keywords or browse by tags.
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredBlogs.map((blog) => (
                    <Link key={blog._id} to={`/blog/${blog.slug}`} className="block group">
                      <Card className="overflow-hidden border transition-all duration-300 hover:shadow-lg hover:border-primary/20 bg-card group-hover:-translate-x-1">
                        <CardContent className="p-0 flex flex-col sm:flex-row">
                          {blog.featuredImage && (
                            <div className="w-full sm:w-64 h-48 sm:h-auto relative overflow-hidden flex-shrink-0">
                                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10" />
                              <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="flex-1 p-6 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="font-normal text-xs hover:bg-secondary">
                                {blog.category}
                              </Badge>
                              {blog.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs font-normal text-muted-foreground">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                              {blog.title}
                            </h3>
                            
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                              {blog.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-dashed">
                              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(blog.publishedAt || blog.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {blog.readingTime} min
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  {blog.viewCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3.5 w-3.5" />
                                  {blog.likeCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Posts */}
            <Card className="shadow-sm border-muted">
              <CardHeader className="pb-3 border-b border-muted/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded shrink-0" />
                        <Skeleton className="h-4 flex-1 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {trendingBlogs.map((blog, index) => (
                      <Link
                        key={blog._id}
                        to={`/blog/${blog.slug}`}
                        className="flex items-start gap-4 group"
                      >
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1">
                            {blog.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {blog.readingTime} min read
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="shadow-sm border-muted">
              <CardHeader className="pb-3 border-b border-muted/50">
                <CardTitle className="text-lg">Popular Topics</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag._id}
                      variant={selectedTag === tag._id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(selectedTag === tag._id ? null : tag._id)}
                      className={`h-8 rounded-full text-xs font-normal border ${selectedTag === tag._id ? '' : 'bg-muted/30 border-muted hover:border-primary/50'}`}
                    >
                      {tag._id} 
                      <span className={`ml-1.5 text-[10px] ${selectedTag === tag._id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {tag.count}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter CTA */}
            <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border-none shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
              <CardContent className="pt-8 pb-8 relative z-10">
                <h3 className="font-bold text-xl mb-2">Stay Updated</h3>
                <p className="text-sm opacity-90 mb-6 leading-relaxed">
                  Join our community of students and get the latest exam strategies delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter your email"
                    className="bg-white/10 border-white/20 placeholder:text-white/60 text-white focus-visible:ring-offset-primary-dark"
                  />
                  <Button variant="secondary" className="w-full font-semibold shadow-md">
                    Subscribe Free
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
