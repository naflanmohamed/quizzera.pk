import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  FolderTree,
  Menu,
  ShieldCheck,
  FileText,
  FileUp,
  FileQuestion
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
        { icon: Users, label: "Users", href: "/admin/users" },
        { icon: Users, label: "Mentors", href: "/admin/mentors" },
        { icon: FolderTree, label: "Categories", href: "/admin/categories" },
        { icon: BookOpen, label: "Quizzes", href: "/admin/quizzes" },
        { icon: FileQuestion, label: "Exams", href: "/admin/exams" },
        { icon: FileUp, label: "Resources", href: "/admin/resources" },
        { icon: FileText, label: "Blogs", href: "/admin/blogs" },
        { icon: Settings, label: "Settings", href: "/admin/settings" },
    ];

    const getInitials = (name: string) =>
        name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 lg:static lg:inset-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <Link to="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg">Quizzera Admin</span>
                        </Link>
                    </div>

                    {/* Nav */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-primary/10 text-primary scale-[1.02]"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 mb-4 px-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback>{getInitials(user?.name || "A")}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start text-destructive hover:text-destructive" 
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="h-16 flex items-center justify-between px-4 mt-2 lg:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                    <span className="font-semibold">Admin Panel</span>
                    <div className="w-9" /> {/* Spacer */}
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
