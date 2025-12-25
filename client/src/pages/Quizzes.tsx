import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

const quizzes = [
  {
    id: 1,
    title: "Biology Quick Quiz",
    category: "MDCAT",
    questions: 20,
    duration: "15 min",
    difficulty: "Medium",
    attempts: 1250,
    icon: "🧬",
  },
  {
    id: 2,
    title: "Mathematics Fundamentals",
    category: "ECAT",
    questions: 25,
    duration: "20 min",
    difficulty: "Easy",
    attempts: 980,
    icon: "📐",
  },
  {
    id: 3,
    title: "English Grammar Test",
    category: "CSS",
    questions: 30,
    duration: "25 min",
    difficulty: "Medium",
    attempts: 2100,
    icon: "📝",
  },
  {
    id: 4,
    title: "Physics Mechanics",
    category: "Entry Tests",
    questions: 20,
    duration: "18 min",
    difficulty: "Hard",
    attempts: 750,
    icon: "⚡",
  },
  {
    id: 5,
    title: "General Knowledge",
    category: "NTS",
    questions: 40,
    duration: "30 min",
    difficulty: "Medium",
    attempts: 3200,
    icon: "🌍",
  },
  {
    id: 6,
    title: "Chemistry Organic",
    category: "MDCAT",
    questions: 25,
    duration: "20 min",
    difficulty: "Hard",
    attempts: 890,
    icon: "🧪",
  },
  {
    id: 7,
    title: "Current Affairs 2024",
    category: "Government",
    questions: 35,
    duration: "25 min",
    difficulty: "Medium",
    attempts: 1650,
    icon: "📰",
  },
  {
    id: 8,
    title: "Logical Reasoning",
    category: "GAT",
    questions: 30,
    duration: "35 min",
    difficulty: "Hard",
    attempts: 1100,
    icon: "🧠",
  },
  {
    id: 9,
    title: "Computer Science Basics",
    category: "Academic",
    questions: 25,
    duration: "20 min",
    difficulty: "Easy",
    attempts: 2400,
    icon: "💻",
  },
];

const categories = [
  "All",
  "MDCAT",
  "ECAT",
  "CSS",
  "NTS",
  "GAT",
  "Academic",
];

const difficultyColors: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
};

const Quizzes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground">Quizzes</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-accent">25K+</div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-warning">Free</div>
              <div className="text-xs text-muted-foreground">Forever</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Quizzes Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
              >
                <CardContent className="p-6">
                  {/* Icon & Category */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {quiz.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {quiz.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileQuestion className="w-4 h-4" />
                      <span>{quiz.questions} Qs</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.duration}</span>
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
                    <span>{quiz.attempts.toLocaleString()} attempts</span>
                  </div>

                  {/* Action */}
                  <Button variant="gradient" className="w-full" asChild>
                    <Link to={`/quiz/${quiz.id}`}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredQuizzes.length === 0 && (
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
