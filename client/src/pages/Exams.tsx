import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Clock, 
  FileQuestion, 
  Users, 
  ArrowRight,
  GraduationCap,
  Briefcase,
  Award,
  Building2,
  BookOpen,
  Code
} from "lucide-react";

const categories = [
  { id: "all", name: "All Exams", icon: BookOpen },
  { id: "entry-tests", name: "Entry Tests", icon: GraduationCap },
  { id: "competitive", name: "Competitive", icon: Award },
  { id: "government", name: "Government", icon: Building2 },
  { id: "certifications", name: "Certifications", icon: Code },
  { id: "professional", name: "Professional", icon: Briefcase },
];

const exams = [
  {
    id: 1,
    name: "MDCAT Practice Test",
    category: "entry-tests",
    description: "Complete medical college admission test preparation with latest pattern",
    questions: 200,
    duration: "3.5 hours",
    students: 15000,
    difficulty: "hard",
    isFree: false,
  },
  {
    id: 2,
    name: "ECAT Engineering Test",
    category: "entry-tests",
    description: "Comprehensive engineering college admission test practice",
    questions: 100,
    duration: "2 hours",
    students: 12000,
    difficulty: "hard",
    isFree: true,
  },
  {
    id: 3,
    name: "CSS General Knowledge",
    category: "competitive",
    description: "Pakistan Affairs, Current Affairs, and General Knowledge for CSS",
    questions: 150,
    duration: "2.5 hours",
    students: 8000,
    difficulty: "medium",
    isFree: false,
  },
  {
    id: 4,
    name: "PPSC Assistant Director",
    category: "government",
    description: "Complete preparation for PPSC AD examination",
    questions: 100,
    duration: "1.5 hours",
    students: 6500,
    difficulty: "medium",
    isFree: true,
  },
  {
    id: 5,
    name: "AWS Solutions Architect",
    category: "certifications",
    description: "Practice for AWS Certified Solutions Architect Associate exam",
    questions: 130,
    duration: "2.5 hours",
    students: 4500,
    difficulty: "hard",
    isFree: false,
  },
  {
    id: 6,
    name: "NTS GAT General",
    category: "entry-tests",
    description: "Graduate Assessment Test preparation for universities",
    questions: 100,
    duration: "2 hours",
    students: 10000,
    difficulty: "medium",
    isFree: true,
  },
  {
    id: 7,
    name: "SBP OG-II Test",
    category: "government",
    description: "State Bank of Pakistan Officer Grade-II exam preparation",
    questions: 100,
    duration: "1.5 hours",
    students: 5500,
    difficulty: "hard",
    isFree: false,
  },
  {
    id: 8,
    name: "Google Cloud Associate",
    category: "certifications",
    description: "GCP Associate Cloud Engineer certification practice",
    questions: 120,
    duration: "2 hours",
    students: 3200,
    difficulty: "medium",
    isFree: false,
  },
];

const difficultyColors = {
  easy: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  hard: "bg-destructive/10 text-destructive",
};

const Exams = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exam.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="category" className="mb-4">
              Exam Library
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Browse All Exams
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from hundreds of practice tests across various categories and start your preparation today.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredExams.length} exams
          </p>

          {/* Exams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExams.map((exam) => (
              <Link key={exam.id} to={`/exam/${exam.id}`}>
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge 
                        className={difficultyColors[exam.difficulty as keyof typeof difficultyColors]}
                      >
                        {exam.difficulty}
                      </Badge>
                      {exam.isFree && (
                        <Badge variant="success">Free</Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                      {exam.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {exam.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <FileQuestion className="w-4 h-4" />
                        {exam.questions} Qs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {(exam.students / 1000).toFixed(1)}K
                      </span>
                    </div>

                    <Button variant="ghost" className="w-full group">
                      Start Practice
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredExams.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No exams found matching your criteria.
              </p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Exams;
