import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Briefcase, 
  Award, 
  Building2, 
  BookOpen, 
  Code,
  ArrowRight,
  Users
} from "lucide-react";

const examCategories = [
  {
    id: "entry-tests",
    name: "Entry Tests",
    description: "MDCAT, ECAT, GAT, NTS, and university admission tests",
    icon: GraduationCap,
    color: "primary",
    exams: 45,
    students: "15K+",
  },
  {
    id: "competitive",
    name: "Competitive Exams",
    description: "CSS, PMS, FPSC, PPSC, and other competitive exams",
    icon: Award,
    color: "accent",
    exams: 32,
    students: "12K+",
  },
  {
    id: "government",
    name: "Government Jobs",
    description: "Banking, Railways, Police, and all govt. job exams",
    icon: Building2,
    color: "warning",
    exams: 28,
    students: "10K+",
  },
  {
    id: "certifications",
    name: "Certifications",
    description: "AWS, Google, Microsoft, and professional certifications",
    icon: Code,
    color: "success",
    exams: 56,
    students: "8K+",
  },
  {
    id: "academic",
    name: "Academic Exams",
    description: "SSC, HSSC, BA, BSc, and all academic exams",
    icon: BookOpen,
    color: "primary",
    exams: 120,
    students: "20K+",
  },
  {
    id: "professional",
    name: "Professional Exams",
    description: "MBA, ACCA, CFA, and professional qualifications",
    icon: Briefcase,
    color: "accent",
    exams: 38,
    students: "6K+",
  },
];

const colorClasses = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "group-hover:border-primary/30",
  },
  accent: {
    bg: "bg-accent/10",
    text: "text-accent",
    border: "group-hover:border-accent/30",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "group-hover:border-warning/30",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
    border: "group-hover:border-success/30",
  },
};

export function ExamCategories() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="category" className="mb-4">
            Exam Categories
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Prepare for Any Exam
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From entry tests to professional certifications, we cover all major exam categories with comprehensive practice materials.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {examCategories.map((category, index) => {
            const colors = colorClasses[category.color as keyof typeof colorClasses];
            return (
              <Link
                key={category.id}
                to={`/exams?category=${category.id}`}
                className="group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card variant="feature" className={`h-full ${colors.border}`}>
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <category.icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">{category.exams}</strong> exams
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {category.students}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
