import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  // Supports both array of roles (future proof) or single string
  const isAdmin = Array.isArray(user.roles) 
    ? user.roles.includes("admin") 
    : user.role === "admin";

  if (!isAdmin) {
    // Redirect non-admins to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Valid admin, render content
  return <Outlet />;
};
