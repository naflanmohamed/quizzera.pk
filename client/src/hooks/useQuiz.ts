import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Fetch all quizzes with optional filters
export function useQuizzes(filters?: { 
  category?: string; 
  difficulty?: string; 
  search?: string;
  isPublished?: boolean;
}) {
  return useQuery({
    queryKey: ["quizzes", filters],
    queryFn: () => api.getQuizzes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single quiz details
export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => api.getQuizById(quizId),
    enabled: !!quizId,
  });
}

// Fetch questions for a quiz (for students - no correct answers)
export function useQuizQuestions(quizId: string, attemptId?: string) {
  return useQuery({
    queryKey: ["quiz-questions", quizId, attemptId],
    queryFn: () => api.getQuizQuestions(quizId),
    enabled: !!quizId && !!attemptId,
  });
}

// Start a quiz attempt
export function useStartAttempt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (quizId: string) => api.startQuizAttempt(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-attempts"] });
      toast({
        title: "Quiz Started",
        description: "Good luck! Your timer has started.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Save answer during quiz
export function useSaveAnswer() {
  return useMutation({
    mutationFn: ({ 
      attemptId, 
      questionId, 
      selectedAnswer,
      markedForReview
    }: { 
      attemptId: string; 
      questionId: string; 
      selectedAnswer: number | null;
      markedForReview?: boolean;
    }) => api.saveAnswer(attemptId, questionId, selectedAnswer, markedForReview),
  });
}

// Submit quiz attempt
export function useSubmitAttempt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ attemptId, payload }: { attemptId: string; payload?: { timeRemaining?: number; answers?: any[] } }) => {
      console.log("Submitting attempt:", attemptId, payload);
      return api.submitQuizAttempt(attemptId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-attempts"] });
      toast({
        title: "Quiz Submitted",
        description: "Your answers have been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Get attempt data (works for both in-progress (resume) and completed (results))
export function useAttempt(attemptId: string) {
  return useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: () => api.getAttemptResults(attemptId),
    enabled: !!attemptId,
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent weird timer jumps
  });
}

// Get user's quiz attempts
export function useMyAttempts(filters?: { quizId?: string; status?: string }) {
  return useQuery({
    queryKey: ["my-attempts", filters],
    queryFn: () => api.getMyAttempts(filters),
  });
}

// Fetch categories for filtering
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
