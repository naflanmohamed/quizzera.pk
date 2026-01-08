import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  Clock,
  User,
  TrendingUp,
  BookOpen,
  Eye,
  Heart,
  Bookmark,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { Blog as BlogType } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Blog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogType[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogType[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<BlogType[]>([]);
  const [tags, setTags] = useState<{ _id: string; count: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, featuredRes, trendingRes, tagsRes] = await Promise.all([
          api.getBlogs({ tag: selectedTag || undefined, status: "published" }),
          api.getFeaturedBlogs(),
          api.getTrendingBlogs(),
          api.getBlogTags()
        ]);

        setPosts(postsRes.blogs);
        setFeaturedPosts(featuredRes);
        setTrendingPosts(trendingRes);
        setTags(tagsRes);
      } catch (error) {
        console.error("Failed to load blog data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load content",
          description: "Please check your connection and try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTag, toast]);

    // Update URL when search changes
    useEffect(() => {
        if (searchQuery) {
            setSearchParams({ search: searchQuery });
        } else {
            setSearchParams({});
        }
    }, [searchQuery, setSearchParams]);


  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="pb-24">
        {/* Premium Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-background">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-float" />
          </div>
          
          <div className="container relative mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium text-sm mb-4 bg-white/50 dark:bg-black/20">
                <BookOpen className="w-4 h-4" />
                <span>Knowledge Hub</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                 Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Insights</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Expert articles, study tips, and educational trends to help you succeed
                in your learning journey.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 relative z-20">
        
          {/* Featured Posts (Carousel style or Grid) */}
          {!isLoading && featuredPosts.length > 0 && !searchQuery && !selectedTag && (
             <div className="mb-20 animate-fade-in">
                <div className="flex items-center gap-2 mb-8">
                   <Bookmark className="w-5 h-5 text-primary" />
                   <h2 className="text-2xl font-bold">Featured Stories</h2>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                   <Link to={`/blog/${featuredPosts[0].slug}`} className="group lg:col-span-2 relative h-[400px] rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 block">
                      <img 
                        src={featuredPosts[0].featuredImage} 
                        alt={featuredPosts[0].title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 sm:p-12 w-full max-w-3xl">
                         <Badge className="mb-4 bg-primary text-white hover:bg-primary/90 border-0">
                            {featuredPosts[0].category}
                         </Badge>
                         <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 line-clamp-2">
                            {featuredPosts[0].title}
                         </h3>
                         <p className="text-white/80 text-lg mb-6 line-clamp-2">
                            {featuredPosts[0].excerpt}
                         </p>
                         <div className="flex items-center gap-6 text-white/70">
                            <span className="font-medium text-white flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {(featuredPosts[0].author as any)?.name}
                            </span>
                            <div className="flex items-center gap-2">
                               <Calendar className="w-4 h-4" />
                               <span>{formatDate(featuredPosts[0].publishedAt || featuredPosts[0].createdAt)}</span>
                            </div>
                             <div className="flex items-center gap-2">
                               <Clock className="w-4 h-4" />
                               <span>{featuredPosts[0].readingTime} min read</span>
                            </div>
                         </div>
                      </div>
                   </Link>
                </div>
             </div>
          )}

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
               
               {/* Search & Filters */}
               <div className="mb-12 mt-8">
                 {/* Glass Search Bar */}
                 <div className="p-2 rounded-2xl glass border border-white/20 shadow-glow flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Search for articles, topics, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
                      />
                    </div>
                  </div>

                  {/* Filter Row */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-6">
                      <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                           {/* Tags Filter */}
                           <Select value={selectedTag || "all"} onValueChange={(val) => setSelectedTag(val === "all" ? null : val)}>
                              <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all focus:ring-primary/20">
                                <SelectValue placeholder="Topics" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Topics</SelectItem>
                                {tags.map((tag) => (
                                  <SelectItem key={tag._id} value={tag._id}>
                                    {tag._id} ({tag.count})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                           </Select>
                      </div>

                       {/* Clear Filters */}
                       {(selectedTag !== null || searchQuery) && (
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setSelectedTag(null);
                            setSearchQuery("");
                          }}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Clear Filters
                          <X className="w-4 h-4 ml-2" />
                        </Button>
                     )}
                  </div>
               </div>

               {/* Articles List */}
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold">
                        {searchQuery ? `Results for "${searchQuery}"` : selectedTag ? `Topic: ${selectedTag}` : "Latest Articles"}
                     </h2>
                  </div>

                  {isLoading ? (
                     Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-6 animate-pulse p-4 rounded-3xl border border-dashed border-border/50">
                           <Skeleton className="w-full md:w-64 h-48 rounded-2xl" />
                           <div className="flex-1 space-y-4 py-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-8 w-3/4" />
                              <Skeleton className="h-20 w-full" />
                              <Skeleton className="h-4 w-32" />
                           </div>
                        </div>
                     ))
                  ) : filteredPosts.length > 0 ? (
                     filteredPosts.map(post => (
                        <article key={post._id} className="group relative flex flex-col md:flex-row gap-6 p-4 -mx-4 rounded-3xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                           <div className="w-full md:w-64 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-muted">
                              {post.featuredImage ? (
                                <img 
                                    src={post.featuredImage} 
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <BookOpen className="w-12 h-12 opacity-20" />
                                </div>
                              )}
                           </div>
                           <div className="flex-1 flex flex-col justify-center">
                              <div className="flex items-center gap-3 mb-3">
                                 <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                    {post.category}
                                 </Badge>
                                 <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {post.readingTime} min read
                                 </span>
                              </div>
                              <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                 <Link to={`/blog/${post.slug}`}>
                                    {post.title}
                                 </Link>
                              </h3>
                              <p className="text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                 {post.excerpt}
                              </p>
                              <div className="flex items-center gap-2 mt-auto">
                                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                      <User className="w-4 h-4 text-primary" />
                                      {(post.author as any)?.name}
                                  </span>
                                  <span className="text-muted-foreground mx-1">•</span>
                                  <span className="text-sm text-muted-foreground">{formatDate(post.publishedAt || post.createdAt)}</span>
                                  
                                  <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" /> {post.viewCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-3.5 h-3.5" /> {post.likeCount}
                                    </span>
                                  </div>
                              </div>
                           </div>
                           <Link to={`/blog/${post.slug}`} className="absolute inset-0 z-10" aria-label={`Read ${post.title}`} />
                        </article>
                     ))
                  ) : (
                     <div className="text-center py-20 rounded-3xl glass border border-dashed border-primary/20">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No articles found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
               {/* Trending Section */}
               <div className="p-6 rounded-3xl glass border border-white/20 shadow-sm mt-8">
                  <div className="flex items-center gap-2 mb-6">
                     <TrendingUp className="w-5 h-5 text-primary" />
                     <h3 className="font-bold text-lg">Trending Now</h3>
                  </div>
                  <div className="space-y-6">
                     {trendingPosts.slice(0, 5).map((post, i) => (
                        <Link key={post._id} to={`/blog/${post.slug}`} className="group flex gap-4 items-start">
                           <span className="text-2xl font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                              {String(i + 1).padStart(2, '0')}
                           </span>
                           <div>
                              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                 {post.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt || post.createdAt)}</p>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>

               {/* Newsletter */}
               <div className="p-6 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                     <h3 className="font-bold text-xl mb-2">Subscribe for Updates</h3>
                     <p className="text-primary-foreground/80 text-sm mb-6">
                        Get the latest study tips and exam strategies delivered to your inbox.
                     </p>
                     <div className="space-y-2">
                        <Input 
                           placeholder="Enter your email" 
                           className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30"
                        />
                        <Button variant="secondary" className="w-full font-bold shadow-lg">
                           Subscribe
                        </Button>
                     </div>
                  </div>
               </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
