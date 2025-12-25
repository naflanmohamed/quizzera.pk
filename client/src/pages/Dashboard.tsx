import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  BarChart3, 
  Trophy, 
  Clock, 
  Target,
  TrendingUp,
  Calendar,
  PlayCircle,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Home,
  FileText,
  Award
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: BookOpen, label: "My Exams", href: "/my-exams" },
  { icon: FileText, label: "Attempts", href: "/attempts" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Award, label: "Achievements", href: "/achievements" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const enrolledExams = [
  { id: 1, name: "MDCAT 2024", progress: 65, nextQuiz: "Biology MCQs", dueDate: "Today" },
  { id: 2, name: "CSS General", progress: 40, nextQuiz: "Pakistan Affairs", dueDate: "Tomorrow" },
  { id: 3, name: "ECAT Engineering", progress: 25, nextQuiz: "Physics Ch-5", dueDate: "In 2 days" },
];

const recentAttempts = [
  { id: 1, name: "Chemistry Mock Test 3", score: 85, total: 100, date: "2 hours ago" },
  { id: 2, name: "Biology Topic: Genetics", score: 18, total: 20, date: "Yesterday" },
  { id: 3, name: "Physics: Mechanics", score: 42, total: 50, date: "2 days ago" },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Quizzera</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Ahmed Hassan</p>
                <p className="text-xs text-muted-foreground truncate">ahmed@example.com</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-2">
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, Ahmed! 👋</h2>
            <p className="text-muted-foreground">Track your progress and continue your exam preparation.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card variant="stat">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tests Completed</p>
                    <p className="text-2xl font-bold text-foreground">47</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="stat">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
                    <p className="text-2xl font-bold text-foreground">78%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="stat">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Study Hours</p>
                    <p className="text-2xl font-bold text-foreground">124</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="stat">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rank</p>
                    <p className="text-2xl font-bold text-foreground">#156</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Enrolled Exams */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Continue Preparation</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/my-exams">
                      View all
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrolledExams.map((exam) => (
                    <div key={exam.id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{exam.name}</h4>
                          <p className="text-sm text-muted-foreground">Next: {exam.nextQuiz}</p>
                        </div>
                        <Badge variant="secondary">{exam.dueDate}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={exam.progress} className="flex-1" />
                        <span className="text-sm font-medium text-foreground">{exam.progress}%</span>
                        <Button size="sm" variant="gradient">
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Attempts */}
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Attempts</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/attempts">
                      View all
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentAttempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {Math.round((attempt.score / attempt.total) * 100)}%
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{attempt.name}</p>
                        <p className="text-xs text-muted-foreground">{attempt.score}/{attempt.total} • {attempt.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
