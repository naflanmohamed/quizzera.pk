import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  BarChart3,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  Home,
  FileText,
  Users,
  Settings,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const isMentor =
    user?.role === "instructor" ||
    (user?.roles && Array.isArray(user.roles) && user.roles.includes("mentor"));

  const items = isMentor
    ? [
        {
          icon: BookOpen,
          label: "Mentor Dashboard",
          href: "/dashboard/mentor",
        },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
      ]
    : [
        { icon: Home, label: "Dashboard", href: "/dashboard" },
        { icon: BookOpen, label: "My Exams", href: "/dashboard/exams" },
        { icon: FileText, label: "My Quiz Bank", href: "/dashboard/quizzes" },
        { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
        { icon: Users, label: "Mentors", href: "/dashboard/mentors" },
        {
          icon: Calendar,
          label: "My Sessions",
          href: "/dashboard/my-bookings",
        },
        { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
      ];

  useEffect(() => {
    if (user) {
      const isAdmin =
        user.role === "admin" ||
        (user.roles &&
          (Array.isArray(user.roles)
            ? user.roles.includes("admin")
            : user.roles === "admin"));

      if (isAdmin) {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out successfully" });
      navigate("/");
    } catch {
      toast({ title: "Error logging out", variant: "destructive" });
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/exams")) return "My Exams";
    if (path.includes("/quizzes")) return "My Quiz Bank";
    if (path.includes("/my-bookings")) return "My Sessions";
    if (path.includes("/messages")) return "Messages";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/mentors")) return "Mentors";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/mentor")) return "Mentor Dashboard";
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Quizzera
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {items.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/dashboard" &&
                  location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground mt-2"
              onClick={handleLogout}
            >
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
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <h1 className="text-xl font-bold text-foreground">
                {getPageTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard/settings">
                  <User className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
