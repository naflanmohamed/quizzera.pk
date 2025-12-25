import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Timer, 
  BarChart3, 
  Brain, 
  Target, 
  Zap, 
  Shield,
  Smartphone,
  Users,
  BookMarked
} from "lucide-react";

const features = [
  {
    icon: Timer,
    title: "Timed Mock Tests",
    description: "Experience real exam conditions with accurately timed practice tests that mirror actual exam patterns.",
    color: "primary",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress with detailed insights on accuracy, speed, and weak areas to optimize your preparation.",
    color: "accent",
  },
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Get personalized study recommendations based on your performance and learning patterns.",
    color: "warning",
  },
  {
    icon: Target,
    title: "Topic-wise Practice",
    description: "Master each topic with focused practice sets and detailed explanations for every question.",
    color: "success",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get immediate feedback with detailed solutions and explanations after each attempt.",
    color: "primary",
  },
  {
    icon: Shield,
    title: "Exam-Pattern Questions",
    description: "Practice with questions curated by experts following the exact pattern of actual exams.",
    color: "accent",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Study anywhere, anytime with our fully responsive platform optimized for all devices.",
    color: "warning",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Join thousands of students, share tips, discuss questions, and learn together.",
    color: "success",
  },
  {
    icon: BookMarked,
    title: "Bookmark & Review",
    description: "Save important questions for later review and create your personalized study sets.",
    color: "primary",
  },
];

const colorClasses = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]",
  },
  accent: {
    bg: "bg-accent/10",
    text: "text-accent",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--accent)/0.15)]",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--warning)/0.15)]",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--success)/0.15)]",
  },
};

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="category" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed with one goal — to help you achieve your exam goals with smart, efficient preparation tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            return (
              <Card 
                key={feature.title}
                variant="interactive" 
                className={`group ${colors.glow} transition-shadow duration-500`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <feature.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
