import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  ArrowRight,
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
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedTag]);

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-light py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 mt-10">Blog & Articles</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Expert tips, study strategies, and exam insights to help you succeed
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Featured Posts */}
            {!searchQuery && featuredBlogs.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Bookmark className="h-6 w-6 text-primary" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isLoading ? (
                    [...Array(2)].map((_, i) => (
                      <Card key={i}>
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="pt-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full mt-2" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    featuredBlogs.slice(0, 2).map((blog) => (
                      <Link key={blog._id} to={`/blog/${blog.slug}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                          {blog.featuredImage && (
                            <div className="aspect-video overflow-hidden">
                              <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <CardContent className="pt-4">
                            <Badge className="mb-2">{blog.category}</Badge>
                            <h3 className="font-bold text-lg line-clamp-2 mb-2">
                              {blog.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {blog.excerpt}
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {blog.readingTime} min read
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {blog.viewCount}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Articles"}
              </h2>

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="flex gap-4 pt-6">
                        <Skeleton className="h-32 w-48 rounded-lg flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full mt-2" />
                          <Skeleton className="h-4 w-1/2 mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredBlogs.length === 0 ? (
                <Card className="p-12 text-center">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
                  <p className="text-muted-foreground">
                    Try a different search term or browse by tags
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredBlogs.map((blog) => (
                    <Link key={blog._id} to={`/blog/${blog.slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="flex flex-col md:flex-row gap-4 pt-6">
                          {blog.featuredImage && (
                            <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{blog.category}</Badge>
                              {blog.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <h3 className="font-bold text-lg line-clamp-2 mb-2">
                              {blog.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                              {blog.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(blog.publishedAt || blog.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {blog.readingTime} min
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {blog.viewCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trendingBlogs.map((blog, index) => (
                      <Link
                        key={blog._id}
                        to={`/blog/${blog.slug}`}
                        className="flex items-start gap-3 group"
                      >
                        <span className="text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {blog.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Subscribe to Newsletter</h3>
                <p className="text-sm opacity-90 mb-4">
                  Get the latest study tips and exam updates delivered to your inbox
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter your email"
                    className="bg-white/10 border-white/20 placeholder:text-white/60"
                  />
                  <Button variant="secondary" className="w-full">
                    Subscribe
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
