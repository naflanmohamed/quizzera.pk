// API Service Layer
// Replace BASE_URL with your MongoDB Express API URL when ready
// const BASE_URL = ""; // e.g., "https://your-api.onrender.com"

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  joinedAt: string;
}

export interface Exam {
  id: string;
  name: string;
  category: string;
  description: string;
  totalQuestions: number;
  duration: number; // minutes
  progress: number;
  nextQuiz?: string;
  dueDate?: string;
  status: "enrolled" | "completed" | "not_started";
  attempts: number;
  bestScore?: number;
}

export interface QuizAttempt {
  id: string;
  examId: string;
  examName: string;
  quizName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skipped: number;
  timeTaken: number; // seconds
  completedAt: string;
  topics: string[];
}

export interface Analytics {
  totalAttempts: number;
  averageScore: number;
  averageAccuracy: number;
  totalStudyHours: number;
  rank: number;
  testsCompleted: number;
  topicPerformance: {
    topic: string;
    accuracy: number;
    attempts: number;
  }[];
  weeklyProgress: {
    day: string;
    score: number;
    attempts: number;
  }[];
  weakAreas: {
    topic: string;
    accuracy: number;
    recommendation: string;
  }[];
  recentTrend: "up" | "down" | "stable";
}

export interface Mentor {
  id: string;
  name: string;
  avatar?: string;
  expertise: string[];
  experience: string;
  bio: string;
  rating: number;
  totalSessions: number;
  availability: string;
  subjects: string[];
}

export interface MentorMessage {
  id: string;
  mentorId: string;
  mentorName: string;
  message: string;
  response?: string;
  createdAt: string;
  status: "pending" | "answered";
}

// Mock Data
const mockUser: User = {
  id: "1",
  name: "Ahmed Hassan",
  email: "ahmed@example.com",
  phone: "+92 300 1234567",
  joinedAt: "2024-06-15",
};

const mockExams: Exam[] = [
  {
    id: "1",
    name: "MDCAT 2024",
    category: "Medical",
    description: "Complete MDCAT preparation with Biology, Chemistry, Physics & English",
    totalQuestions: 200,
    duration: 210,
    progress: 65,
    nextQuiz: "Biology MCQs",
    dueDate: "Today",
    status: "enrolled",
    attempts: 12,
    bestScore: 85,
  },
  {
    id: "2",
    name: "CSS General Knowledge",
    category: "Government",
    description: "Civil Services exam preparation - General Knowledge section",
    totalQuestions: 100,
    duration: 120,
    progress: 40,
    nextQuiz: "Pakistan Affairs",
    dueDate: "Tomorrow",
    status: "enrolled",
    attempts: 8,
    bestScore: 72,
  },
  {
    id: "3",
    name: "ECAT Engineering",
    category: "Engineering",
    description: "Engineering College Admission Test preparation",
    totalQuestions: 100,
    duration: 100,
    progress: 25,
    nextQuiz: "Physics Ch-5",
    dueDate: "In 2 days",
    status: "enrolled",
    attempts: 5,
    bestScore: 68,
  },
  {
    id: "4",
    name: "NTS GAT General",
    category: "Graduate",
    description: "Graduate Assessment Test for higher education",
    totalQuestions: 100,
    duration: 120,
    progress: 0,
    status: "not_started",
    attempts: 0,
  },
  {
    id: "5",
    name: "PPSC Lecturer",
    category: "Government",
    description: "Punjab Public Service Commission Lecturer exam",
    totalQuestions: 100,
    duration: 90,
    progress: 100,
    status: "completed",
    attempts: 15,
    bestScore: 92,
  },
];

const mockQuizAttempts: QuizAttempt[] = [
  {
    id: "1",
    examId: "1",
    examName: "MDCAT 2024",
    quizName: "Chemistry Mock Test 3",
    score: 85,
    totalQuestions: 100,
    correctAnswers: 85,
    incorrectAnswers: 12,
    skipped: 3,
    timeTaken: 5400,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    topics: ["Organic Chemistry", "Chemical Bonding"],
  },
  {
    id: "2",
    examId: "1",
    examName: "MDCAT 2024",
    quizName: "Biology Topic: Genetics",
    score: 90,
    totalQuestions: 20,
    correctAnswers: 18,
    incorrectAnswers: 2,
    skipped: 0,
    timeTaken: 1200,
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    topics: ["Genetics", "Molecular Biology"],
  },
  {
    id: "3",
    examId: "3",
    examName: "ECAT Engineering",
    quizName: "Physics: Mechanics",
    score: 84,
    totalQuestions: 50,
    correctAnswers: 42,
    incorrectAnswers: 6,
    skipped: 2,
    timeTaken: 2700,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    topics: ["Mechanics", "Motion"],
  },
  {
    id: "4",
    examId: "2",
    examName: "CSS General Knowledge",
    quizName: "Pakistan History",
    score: 75,
    totalQuestions: 40,
    correctAnswers: 30,
    incorrectAnswers: 8,
    skipped: 2,
    timeTaken: 2400,
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    topics: ["History", "Pakistan Studies"],
  },
  {
    id: "5",
    examId: "1",
    examName: "MDCAT 2024",
    quizName: "English Vocabulary",
    score: 92,
    totalQuestions: 25,
    correctAnswers: 23,
    incorrectAnswers: 2,
    skipped: 0,
    timeTaken: 900,
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    topics: ["Vocabulary", "Grammar"],
  },
];

const mockAnalytics: Analytics = {
  totalAttempts: 47,
  averageScore: 78,
  averageAccuracy: 76,
  totalStudyHours: 124,
  rank: 156,
  testsCompleted: 47,
  topicPerformance: [
    { topic: "Biology", accuracy: 82, attempts: 15 },
    { topic: "Chemistry", accuracy: 75, attempts: 12 },
    { topic: "Physics", accuracy: 68, attempts: 10 },
    { topic: "English", accuracy: 88, attempts: 5 },
    { topic: "Pakistan Studies", accuracy: 72, attempts: 5 },
  ],
  weeklyProgress: [
    { day: "Mon", score: 72, attempts: 3 },
    { day: "Tue", score: 78, attempts: 4 },
    { day: "Wed", score: 75, attempts: 2 },
    { day: "Thu", score: 82, attempts: 5 },
    { day: "Fri", score: 80, attempts: 3 },
    { day: "Sat", score: 85, attempts: 6 },
    { day: "Sun", score: 79, attempts: 2 },
  ],
  weakAreas: [
    { topic: "Physics - Thermodynamics", accuracy: 45, recommendation: "Review Chapter 8-10, practice more MCQs" },
    { topic: "Chemistry - Electrochemistry", accuracy: 52, recommendation: "Focus on electrode potentials and cells" },
    { topic: "Biology - Plant Physiology", accuracy: 58, recommendation: "Revise photosynthesis and respiration" },
  ],
  recentTrend: "up",
};

const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Dr. Sarah Khan",
    expertise: ["MDCAT", "Biology", "Chemistry"],
    experience: "15 years teaching",
    bio: "Former MBBS examiner with extensive experience in medical entrance test preparation.",
    rating: 4.9,
    totalSessions: 500,
    availability: "Mon-Fri, 9AM-5PM",
    subjects: ["Biology", "Chemistry"],
  },
  {
    id: "2",
    name: "Prof. Ali Ahmed",
    expertise: ["ECAT", "Physics", "Mathematics"],
    experience: "12 years teaching",
    bio: "PhD in Physics, specialized in engineering entrance exam preparation.",
    rating: 4.8,
    totalSessions: 420,
    availability: "Mon-Sat, 10AM-6PM",
    subjects: ["Physics", "Mathematics"],
  },
  {
    id: "3",
    name: "Ms. Fatima Zahra",
    expertise: ["CSS", "English", "General Knowledge"],
    experience: "10 years teaching",
    bio: "CSS qualified officer with expertise in English and Current Affairs.",
    rating: 4.7,
    totalSessions: 350,
    availability: "Tue-Sat, 11AM-7PM",
    subjects: ["English", "Current Affairs"],
  },
];

const mockMentorMessages: MentorMessage[] = [
  {
    id: "1",
    mentorId: "1",
    mentorName: "Dr. Sarah Khan",
    message: "I'm struggling with organic chemistry reactions. Can you help?",
    response: "Of course! Let's start with the basics. Focus on reaction mechanisms first.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "answered",
  },
  {
    id: "2",
    mentorId: "2",
    mentorName: "Prof. Ali Ahmed",
    message: "How should I approach physics numericals for ECAT?",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API Functions - Replace these with real API calls when ready
export const api = {
  // Auth
  async login(email: string, password: string) {
    await delay(800);
    if (email && password) {
      return { success: true, user: mockUser, token: "mock-jwt-token" };
    }
    throw new Error("Invalid credentials");
  },

  async loginWithGoogle(_token: string) {
    await delay(800);
    return { success: true, user: mockUser, token: "mock-jwt-token" };
  },

  async register(name: string, email: string, _password: string) {
    await delay(800);
    return { success: true, user: { ...mockUser, name, email } };
  },

  async logout() {
    await delay(300);
    return { success: true };
  },

  // User
  async getProfile() {
    await delay(500);
    return mockUser;
  },

  async updateProfile(data: Partial<User>) {
    await delay(600);
    return { ...mockUser, ...data };
  },

  async changePassword(_currentPassword: string, _newPassword: string) {
    await delay(500);
    return { success: true };
  },

  // Exams
  async getExams(filters?: { status?: string; category?: string }) {
    await delay(600);
    let exams = [...mockExams];
    if (filters?.status) {
      exams = exams.filter((e) => e.status === filters.status);
    }
    if (filters?.category) {
      exams = exams.filter((e) => e.category === filters.category);
    }
    return exams;
  },

  async getExamById(id: string) {
    await delay(400);
    return mockExams.find((e) => e.id === id);
  },

  async enrollInExam(_examId: string) {
    await delay(500);
    return { success: true };
  },

  // Quizzes
  async getQuizAttempts(filters?: { examId?: string; dateFrom?: string; dateTo?: string; minScore?: number }) {
    await delay(600);
    let attempts = [...mockQuizAttempts];
    if (filters?.examId) {
      attempts = attempts.filter((a) => a.examId === filters.examId);
    }
    if (filters?.minScore !== undefined) {
      attempts = attempts.filter((a) => a.score >= filters.minScore!);
    }
    return attempts;
  },

  async getQuizAttemptById(id: string) {
    await delay(400);
    return mockQuizAttempts.find((a) => a.id === id);
  },

  // Analytics
  async getAnalytics() {
    await delay(700);
    return mockAnalytics;
  },

  // Mentors
  async getMentors(filters?: { subject?: string }) {
    await delay(500);
    let mentors = [...mockMentors];
    if (filters?.subject) {
      mentors = mentors.filter((m) => 
        m.subjects.some((s) => s.toLowerCase().includes(filters.subject!.toLowerCase()))
      );
    }
    return mentors;
  },

  async getMentorById(id: string) {
    await delay(400);
    return mockMentors.find((m) => m.id === id);
  },

  async sendMentorMessage(mentorId: string, message: string) {
    await delay(600);
    return {
      id: Date.now().toString(),
      mentorId,
      mentorName: mockMentors.find((m) => m.id === mentorId)?.name || "",
      message,
      createdAt: new Date().toISOString(),
      status: "pending" as const,
    };
  },

  async getMentorMessages() {
    await delay(500);
    return mockMentorMessages;
  },
};
