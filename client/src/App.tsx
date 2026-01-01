import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Exams from "./pages/Exams";
import Quizzes from "./pages/Quizzes";
import QuizDetail from "./pages/QuizDetail";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import Mentors from "./pages/Mentors";
import NotFound from "./pages/NotFound";
import Resources from "./pages/Resources";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";

// Dashboard pages
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import MyExams from "./pages/dashboard/MyExams";
import MyQuizzes from "./pages/dashboard/MyQuizzes";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import DashboardMentors from "./pages/dashboard/DashboardMentors";
import SettingsPage from "./pages/dashboard/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/:id" element={<Quiz />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            
            {/* Quiz Routes */}
            <Route path="/quiz/:id" element={<QuizDetail />} />
            <Route path="/quiz/:id/attempt/:attemptId" element={<Quiz />} />
            <Route path="/quiz/:id/results/:attemptId" element={<QuizResults />} />
            
            <Route path="/mentors" element={<Mentors />} />
            
            {/* Dashboard routes with shared layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="exams" element={<MyExams />} />
              <Route path="quizzes" element={<MyQuizzes />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="mentors" element={<DashboardMentors />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Legacy routes */}
            <Route path="/my-exams" element={<MyExams />} />
            <Route path="/attempts" element={<MyQuizzes />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />     
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
