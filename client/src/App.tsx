import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthProvider";
import { ConnectionProvider } from "@/providers/ConnectionProvider";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Exams from "./pages/Exams";
import ExamDetail from "./pages/ExamDetail";
import ExamPlayer from "./pages/ExamPlayer";
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
import BecomeMentor from "./pages/dashboard/BecomeMentor";
import SettingsPage from "./pages/dashboard/SettingsPage";
import MentorBookings from "./pages/dashboard/MentorBookings";
import MentorMessages from "./pages/dashboard/MentorMessages";
import StudentBookings from "./pages/dashboard/StudentBookings";

// Admin pages
import { AdminRoute } from "@/components/AdminRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminResources from "./pages/admin/AdminResources";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminQuizEditor from "./pages/admin/AdminQuizEditor";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminExams from "./pages/admin/AdminExams";
import AdminExamEditor from "./pages/admin/AdminExamEditor";
import AdminMentorApplications from "./pages/admin/AdminMentorApplications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ConnectionProvider>
        <TooltipProvider>
          <ConnectionStatus />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/exams/:id" element={<ExamDetail />} />
              <Route path="/exam-player/:attemptId" element={<ExamPlayer />} />
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
                <Route path="mentor-bookings" element={<MentorBookings />} />
                <Route path="my-bookings" element={<StudentBookings />} />
                <Route path="messages" element={<MentorMessages />} />
                <Route path="become-mentor" element={<BecomeMentor />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="mentors" element={<AdminMentorApplications />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="quizzes" element={<AdminQuizzes />} />
                  <Route path="quizzes/:id" element={<AdminQuizEditor />} />
                  <Route path="exams" element={<AdminExams />} />
                  <Route path="exams/:id" element={<AdminExamEditor />} />
                  <Route path="resources" element={<AdminResources />} />
                  <Route path="blogs" element={<AdminBlogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
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
      </ConnectionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
