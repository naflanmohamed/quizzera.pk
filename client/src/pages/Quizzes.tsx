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
} from "lucide-react";
import { useState } from "react";
import { useQuizzes, useCategories } from "@/hooks/useQuiz";

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

  const categoryOptions = ["All", ...categories.map((c) => c.name)];
  const difficultyOptions = ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Quick Practice
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Practice <span className="text-primary">Quizzes</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sharpen your skills with topic-wise quizzes. Quick, focused practice
              sessions to boost your exam preparation.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl mx-auto">
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-primary">
                {quizzesLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : quizzes.length}+
              </div>
              <div className="text-xs text-muted-foreground">Quizzes</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-accent">
                {quizzesLoading ? (
                  <Skeleton className="h-8 w-12 mx-auto" />
                ) : (
                  `${quizzes.reduce((acc, q) => acc + (q.totalQuestions || 0), 0)}+`
                )}
              </div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-warning">Free</div>
              <div className="text-xs text-muted-foreground">Forever</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md mx-auto w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categoriesLoading ? (
                [...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-20" />
                ))
              ) : (
                categoryOptions.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))
              )}
            </div>

            {/* Difficulty Filter */}
            <div className="flex justify-center gap-2">
              {difficultyOptions.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={
                    selectedDifficulty === difficulty
                      ? ""
                      : difficulty !== "All"
                      ? difficultyColors[difficulty]
                      : ""
                  }
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {quizzesLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
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
                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
                  >
                    <CardContent className="p-6">
                      {/* Icon & Category */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          {quiz.tags?.[0]?.charAt(0) || "Q"}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {categoryName}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FileQuestion className="w-4 h-4" />
                          <span>{quiz.totalQuestions} Qs</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.duration} min</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${difficultyColors[quiz.difficulty]}`}
                        >
                          {quiz.difficulty}
                        </Badge>
                      </div>

                      {/* Attempts */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <TrendingUp className="w-3 h-3" />
                        <span>{(quiz.totalAttempts || 0).toLocaleString()} attempts</span>
                      </div>

                      {/* Action */}
                      <Button variant="gradient" className="w-full" asChild>
                        <Link to={`/quiz/${quiz._id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Start Quiz
                        </Link>
                      </Button>
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
