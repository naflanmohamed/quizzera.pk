import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Search,
  Clock,
  FileQuestion,
  Play,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  X
} from "lucide-react";
import { useState } from "react";
import { useQuizzes, useCategories } from "@/hooks/useQuiz";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const difficultyColors: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
};

const Quizzes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  // Fetch categories from API
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Fetch quizzes with filters
  const { data: quizzes = [], isLoading: quizzesLoading, error } = useQuizzes({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    search: searchQuery || undefined,
    isPublished: true,
  });

  const difficultyOptions = ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="pb-24">
         {/* Premium Hero Section */}
         <section className="relative pt-32 pb-40 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-background">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-float" />
          </div>
          
          <div className="container relative mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium text-sm mb-4 bg-white/50 dark:bg-black/20">
                <Zap className="w-4 h-4" />
                <span>Quick Practice Mode</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                 Sharpen Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Skills</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Topic-wise quizzes designed for rapid revision. Test your knowledge
                and boost your speed with focused practice sessions.
              </p>

              {/* Stats Preview */}
              <div className="flex justify-center gap-8 pt-4">
                <div className="flex flex-col items-center">
                   <div className="text-3xl font-bold text-foreground">
                     {quizzesLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : `${quizzes.length}+`}
                   </div>
                   <div className="text-sm text-muted-foreground">Quizzes</div>
                </div>
                <div className="w-px h-12 bg-border/50" />
                <div className="flex flex-col items-center">
                   <div className="text-3xl font-bold text-foreground">
                    {quizzesLoading ? (
                      <Skeleton className="h-8 w-12 mx-auto" />
                    ) : (
                      `${quizzes.reduce((acc, q) => acc + (q.totalQuestions || 0), 0)}+`
                    )}
                   </div>
                   <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                 <div className="w-px h-12 bg-border/50" />
                 <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">Free</span>
                    <span className="text-sm text-muted-foreground">Forever</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Content Section */}
        <div className="container mx-auto px-4 -mt-20 relative z-20">
           {/* Glass Search Bar */}
          <div className="max-w-4xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="p-2 rounded-2xl glass border border-white/20 shadow-glow flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search quiz bank..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
                />
              </div>
            </div>
            

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto items-center justify-between mt-4">
               
               <div className="flex items-center gap-4 flex-1 w-full md:w-auto mt-4">
                 {/* Category Filter */}
                 <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={categoriesLoading}>
                    <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all focus:ring-primary/20">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                 </Select>

                 {/* Difficulty Filter */}
                 <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-full md:w-[150px] h-11 bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all focus:ring-primary/20">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Difficulties</SelectItem>
                      {difficultyOptions.filter(d => d !== "All").map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
               </div>

               {/* Clear Filters */}
               {(selectedCategory !== "All" || selectedDifficulty !== "All" || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedDifficulty("All");
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

          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Quiz Bank
            </h2>
             {!quizzesLoading && (
                <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                  Showing {quizzes.length} quizzes
                </Badge>
             )}
          </div>

          {/* Loading State */}
          {quizzesLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-[280px] animate-pulse bg-muted/20 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <div className="flex gap-3 mb-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load quizzes</h3>
              <p className="text-muted-foreground">Please try again later</p>
            </div>
          )}

          {/* Quizzes Grid */}
          {!quizzesLoading && !error && quizzes.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const categoryName =
                  typeof quiz.category === "object" ? quiz.category.name : quiz.category;

                return (
                  <Card
                    key={quiz._id}
                    className="group border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-1 overflow-hidden relative"
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     
                    <CardContent className="p-6 relative">
                      {/* Icon & Category */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                          {quiz.tags?.[0]?.charAt(0) || "Q"}
                        </div>
                        <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                          {categoryName}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FileQuestion className="w-3.5 h-3.5" />
                          <span>{quiz.totalQuestions} Qs</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{quiz.duration} min</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${difficultyColors[quiz.difficulty]} border-0`}
                        >
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      
                      {/* Divider */}
                      <div className="w-full h-px bg-border/50 mb-4" />

                      {/* Attempts */}
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp className="w-3 h-3" />
                            <span>{(quiz.totalAttempts || 0).toLocaleString()} attempts</span>
                        </div>
                        
                         <Button variant="ghost" size="sm" className="h-8 -mr-2 text-primary hover:bg-primary/10" asChild>
                            <Link to={`/quiz/${quiz._id}`}>
                              Start
                              <Play className="w-3.5 h-3.5 ml-1.5 fill-current" />
                            </Link>
                          </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!quizzesLoading && !error && quizzes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default Quizzes;
