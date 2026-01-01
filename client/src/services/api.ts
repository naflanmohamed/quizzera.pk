import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

// ============================================
// CONFIGURATION
// ============================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ============================================
// TYPES - Matching MERN Backend Models
// ============================================

// User Types
export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: "user" | "admin" | "instructor";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parent?: string | Category;
  isActive: boolean;
  order: number;
  quizCount?: number;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

// Quiz Types
export interface Quiz {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string | Category;
  difficulty: "easy" | "medium" | "hard" | "expert";
  duration: number;
  totalQuestions: number;
  passingScore: number;
  instructions?: string[];
  tags?: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  isPremium: boolean;
  totalAttempts: number;
  averageScore: number;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

// Question Types
export interface QuestionOption {
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  _id: string;
  quiz: string;
  questionText: string;
  questionType: "single" | "multiple" | "true_false" | "fill_blank";
  options: { text: string; isCorrect?: boolean }[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  negativeMarks: number;
  order: number;
  tags?: string[];
}

// Quiz Attempt Types
export interface AttemptAnswer {
  question: string;
  selectedOptions: number[];
  isCorrect?: boolean;
  marksObtained?: number;
  timeTaken?: number;
}

export interface QuizAttempt {
  _id: string;
  user: string | User;
  quiz: string | Quiz;
  answers: AttemptAnswer[];
  status: "in_progress" | "completed" | "abandoned";
  startTime: string;
  endTime?: string;
  totalMarks?: number;
  obtainedMarks?: number;
  percentage?: number;
  isPassed?: boolean;
  timeTaken?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptDetail {
  _id: string;
  quizName: string;
  user: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  submittedAt?: string;
  answers: AttemptAnswer[];
  score?: number;
  percentage?: number;
  totalQuestions: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  completedAt: string;
  skipped?: number;
  timeTaken?: number;
  rank?: number;
}

// PDF Resource Types
export interface PdfResource {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  category: string | Category;
  subject?: string;
  resourceType: "notes" | "past_paper" | "syllabus" | "formula_sheet" | "guide" | "other";
  isPremium: boolean;
  downloadCount: number;
  viewCount: number;
  uploadedBy: string | User;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Blog Types
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  relatedExam?: string | Category;
  tags: string[];
  author: string | User;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface Analytics {
  totalAttempts: number;
  averageScore: number;
  averageAccuracy: number;
  totalStudyHours: number;
  rank?: number;
  testsCompleted: number;
  topicPerformance: { topic: string; accuracy: number; attempts: number }[];
  weeklyProgress: { day: string; score: number; attempts: number }[];
  weakAreas: { topic: string; accuracy: number; recommendation: string }[];
  recentTrend: "up" | "down" | "stable";
}

// Mentor Types
export interface Mentor {
  _id: string;
  user: string | User;
  expertise: string[];
  supportedExams: string[];
  experience?: string;
  bio?: string;
  rating: number;
  totalSessions: number;
  hourlyRate?: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

// Legacy Types for backward compatibility
export interface Exam {
  id: string;
  name: string;
  category: string;
  description: string;
  totalQuestions: number;
  duration: number;
  progress: number;
  nextQuiz?: string;
  dueDate?: string;
  status: "enrolled" | "completed" | "not_started";
  attempts: number;
  bestScore?: number;
}

export interface QuizAttemptLegacy {
  id: string;
  examId: string;
  examName: string;
  quizName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skipped: number;
  timeTaken: number;
  completedAt: string;
  topics: string[];
}

// Study Streak Tracking
export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  streakHistory: { date: string; studied: boolean }[];
}

// Goal Management
export interface StudyGoal {
  id: string;
  type: "daily_questions" | "weekly_hours" | "monthly_tests" | "target_score";
  title: string;
  target: number;
  current: number;
  deadline?: string;
  isCompleted: boolean;
}

// Peer Comparison
export interface PerformanceComparison {
  yourScore: number;
  averageScore: number;
  topPerformerScore: number;
  percentile: number;
  topicComparison: { topic: string; you: number; average: number }[];
}

// Activity Feed Item
export interface ActivityItem {
  id: string;
  type: "quiz_completed" | "goal_achieved" | "streak_milestone" | "badge_earned";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

// Extended Analytics
export interface DetailedAnalytics extends Analytics {
  studyStreak: StudyStreak;
  goals: StudyGoal[];
  comparison: PerformanceComparison;
  monthlyProgress: { month: string; score: number; attempts: number }[];
  accuracyTrend: { date: string; accuracy: number }[];
  timeSpentByTopic: { topic: string; hours: number; color: string }[];
  questionTypePerformance: { type: string; accuracy: number; total: number }[];
  recentActivity: ActivityItem[];
  studyRecommendations: { topic: string; priority: "high" | "medium" | "low"; reason: string }[];
}


// ============================================
// AXIOS INSTANCE WITH INTERCEPTORS
// ============================================

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor - Add Auth Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const message = error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// ============================================
// API FUNCTIONS
// ============================================

export const api = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    return response.data;
  },

  async loginWithGoogle(token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/google", { token });
    return response.data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", { name, email, password });
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data!;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>("/auth/updatedetails", data);
    return response.data.data!;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put("/auth/updatepassword", { currentPassword, newPassword });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgotpassword", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.put(`/auth/resetpassword/${token}`, { password });
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>("/categories");
    return response.data.data || [];
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data!;
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return response.data.data!;
  },

  // ==========================================
  // QUIZZES
  // ==========================================
  
  async getQuizzes(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
    isPublished?: boolean;
  }): Promise<Quiz[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.difficulty) params.append("difficulty", filters.difficulty);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.isPublished !== undefined) params.append("isPublished", String(filters.isPublished));

    const response = await apiClient.get<ApiResponse<Quiz[]>>(`/quizzes?${params.toString()}`);
    return response.data.data || [];
  },

  async getQuizById(id: string): Promise<Quiz> {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
    return response.data.data!;
  },

  async getQuizBySlug(slug: string): Promise<Quiz> {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/slug/${slug}`);
    return response.data.data!;
  },

  async getFeaturedQuizzes(limit: number = 5): Promise<Quiz[]> {
    const response = await apiClient.get<ApiResponse<Quiz[]>>("/quizzes/featured", { params: { limit } });
    return response.data.data || [];
  },

  async getPopularQuizzes(limit: number = 5): Promise<Quiz[]> {
    const response = await apiClient.get<ApiResponse<Quiz[]>>("/quizzes/popular", { params: { limit } });
    return response.data.data || [];
  },

  // ==========================================
  // QUESTIONS
  // ==========================================
  
  async getQuizQuestions(quizId: string): Promise<Question[]> {
    const response = await apiClient.get<ApiResponse<Question[]>>(`/quizzes/${quizId}/questions`);
    return response.data.data || [];
  },

  // ==========================================
  // QUIZ ATTEMPTS
  // ==========================================
  
  async startQuizAttempt(quizId: string): Promise<{ attempt: QuizAttemptDetail; questions: Question[] }> {
    const response = await apiClient.post<ApiResponse<{ attempt: QuizAttemptDetail; questions: Question[] }>>("/attempts/start", { quizId });
    return response.data.data!;
  },

  async saveAnswer(attemptId: string, questionId: string, selectedOption: number): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`/attempts/${attemptId}/answer`, { questionId, selectedOption });
    return response.data;
  },

  async submitQuizAttempt(attemptId: string): Promise<QuizAttemptDetail> {
    const response = await apiClient.post<ApiResponse<QuizAttemptDetail>>(`/attempts/${attemptId}/submit`);
    return response.data.data!;
  },

  async getAttemptResults(attemptId: string): Promise<QuizAttemptDetail & { questions: (Question & { userAnswer?: number })[] }> {
    const response = await apiClient.get<ApiResponse<QuizAttemptDetail & { questions: (Question & { userAnswer?: number })[] }>>(`/attempts/${attemptId}/results`);
    return response.data.data!;
  },

  async getMyAttempts(filters?: { quizId?: string; status?: string }): Promise<QuizAttemptDetail[]> {
    const params = new URLSearchParams();
    if (filters?.quizId) params.append("quizId", filters.quizId);
    if (filters?.status) params.append("status", filters.status);

    const response = await apiClient.get<ApiResponse<QuizAttemptDetail[]>>(`/attempts/my-attempts?${params.toString()}`);
    return response.data.data || [];
  },

  async getAttemptById(id: string): Promise<QuizAttempt> {
    const response = await apiClient.get<ApiResponse<QuizAttempt>>(`/attempts/${id}`);
    return response.data.data!;
  },

  async getLeaderboard(quizId: string, limit: number = 10): Promise<{ user: User; score: number; timeTaken: number }[]> {
    const response = await apiClient.get<ApiResponse<{ user: User; score: number; timeTaken: number }[]>>(`/attempts/leaderboard/${quizId}`, { params: { limit } });
    return response.data.data || [];
  },

  // ==========================================
  // PDF RESOURCES
  // ==========================================
  
  async getPdfs(params?: {
    category?: string;
    resourceType?: string;
    premium?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ pdfs: PdfResource[]; pagination?: ApiResponse<PdfResource[]>["pagination"] }> {
    const response = await apiClient.get<ApiResponse<PdfResource[]>>("/resources/pdfs", { params });
    return { pdfs: response.data.data || [], pagination: response.data.pagination };
  },

  async getPdfById(id: string): Promise<PdfResource> {
    const response = await apiClient.get<ApiResponse<PdfResource>>(`/resources/pdfs/${id}`);
    return response.data.data!;
  },

  async downloadPdf(id: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ downloadUrl: string }>>(`/resources/pdfs/${id}/download`);
    return response.data.data!.downloadUrl;
  },

  async getResourceTypes(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>("/resources/pdfs/types");
    return response.data.data || [];
  },

  // ==========================================
  // BLOGS
  // ==========================================
  
  async getBlogs(params?: {
    category?: string;
    tag?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ blogs: Blog[]; pagination?: ApiResponse<Blog[]>["pagination"] }> {
    const response = await apiClient.get<ApiResponse<Blog[]>>("/blogs", { params });
    return { blogs: response.data.data || [], pagination: response.data.pagination };
  },

  async getBlogBySlug(slug: string): Promise<Blog> {
    const response = await apiClient.get<ApiResponse<Blog>>(`/blogs/slug/${slug}`);
    return response.data.data!;
  },

  async getBlogById(id: string): Promise<Blog> {
    const response = await apiClient.get<ApiResponse<Blog>>(`/blogs/${id}`);
    return response.data.data!;
  },

  async getFeaturedBlogs(limit: number = 5): Promise<Blog[]> {
    const response = await apiClient.get<ApiResponse<Blog[]>>("/blogs/featured", { params: { limit } });
    return response.data.data || [];
  },

  async getTrendingBlogs(limit: number = 5): Promise<Blog[]> {
    const response = await apiClient.get<ApiResponse<Blog[]>>("/blogs/trending", { params: { limit } });
    return response.data.data || [];
  },

  async likeBlog(id: string): Promise<Blog> {
    const response = await apiClient.post<ApiResponse<Blog>>(`/blogs/${id}/like`);
    return response.data.data!;
  },

  async getBlogTags(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>("/blogs/tags");
    return response.data.data || [];
  },

  // ==========================================
  // ANALYTICS
  // ==========================================
  
  async getAnalytics(): Promise<Analytics> {
    const response = await apiClient.get<ApiResponse<Analytics>>("/analytics");
    return response.data.data!;
  },

  async getTopicPerformance(): Promise<Analytics["topicPerformance"]> {
    const response = await apiClient.get<ApiResponse<Analytics["topicPerformance"]>>("/analytics/topics");
    return response.data.data || [];
  },

  async getWeeklyProgress(): Promise<Analytics["weeklyProgress"]> {
    const response = await apiClient.get<ApiResponse<Analytics["weeklyProgress"]>>("/analytics/weekly");
    return response.data.data || [];
  },

  // ==========================================
  // MENTORS
  // ==========================================
  
  async getMentors(params?: {
    expertise?: string;
    available?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ mentors: Mentor[]; pagination?: ApiResponse<Mentor[]>["pagination"] }> {
    const response = await apiClient.get<ApiResponse<Mentor[]>>("/mentors", { params });
    return { mentors: response.data.data || [], pagination: response.data.pagination };
  },

  async getMentorById(id: string): Promise<Mentor> {
    const response = await apiClient.get<ApiResponse<Mentor>>(`/mentors/${id}`);
    return response.data.data!;
  },

  // ==========================================
  // LEGACY SUPPORT (for existing components)
  // ==========================================
  
  async getExams(filters?: { status?: string; category?: string }): Promise<Quiz[]> {
    const quizzes = await this.getQuizzes({
      category: filters?.category,
    });
    return quizzes;
  },

  async getExamById(id: string): Promise<Quiz> {
    return this.getQuizById(id);
  },

  async enrollInExam(_examId: string): Promise<{ success: boolean }> {
    return { success: true };
  },

  async getQuizAttempts(filters?: { examId?: string; minScore?: number }): Promise<QuizAttemptDetail[]> {
    const attempts = await this.getMyAttempts({ quizId: filters?.examId });
    return attempts;
  },

  async getQuizAttemptById(id: string): Promise<QuizAttempt> {
    return this.getAttemptById(id);
  },

  async sendMentorMessage(mentorId: string, message: string) {
    return {
      id: Date.now().toString(),
      mentorId,
      message,
      createdAt: new Date().toISOString(),
      status: "pending" as const,
    };
  },

  async getMentorMessages() {
    return [];
  },
};

export { apiClient };
export default api;
