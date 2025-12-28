const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    // Which user took this quiz
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Which quiz was attempted
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    
    // User's answers
    answers: [{
      // Question reference
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      // User's selected answer(s)
      selectedAnswer: {
        type: mongoose.Schema.Types.Mixed  // String or Array of Strings
      },
      // Was it correct?
      isCorrect: {
        type: Boolean,
        default: false
      },
      // Points earned for this question
      pointsEarned: {
        type: Number,
        default: 0
      },
      // Time taken for this question (seconds)
      timeTaken: {
        type: Number,
        default: 0
      },
      // Was this question marked for review?
      markedForReview: {
        type: Boolean,
        default: false
      },
      // When was this question answered
      answeredAt: {
        type: Date
      }
    }],
    
    // Attempt status
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned', 'timed_out'],
      default: 'in_progress'
    },
    
    // Score details
    score: {
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 },
      unanswered: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      maxPoints: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      passed: { type: Boolean, default: false }
    },
    
    // Time tracking
    startedAt: {
      type: Date,
      default: Date.now
    },
    
    completedAt: {
      type: Date
    },
    
    // Total time taken in seconds
    timeTaken: {
      type: Number,
      default: 0
    },
    
    // Time remaining when submitted (for reference)
    timeRemaining: {
      type: Number,
      default: 0
    },
    
    // Current question index (for resuming)
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    
    // IP address (for security)
    ipAddress: {
      type: String
    },
    
    // User agent (device info)
    userAgent: {
      type: String
    },
    
    // Tab switch count (for proctoring)
    tabSwitchCount: {
      type: Number,
      default: 0
    },
    
    // Copy-paste attempts (for proctoring)
    copyPasteCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ===== VIRTUAL: Get duration in minutes =====
quizAttemptSchema.virtual('durationMinutes').get(function() {
  return Math.round(this.timeTaken / 60);
});

// ===== VIRTUAL: Get grade =====
quizAttemptSchema.virtual('grade').get(function() {
  const percentage = this.score.percentage;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
});

// ===== METHOD: Calculate and update score =====
quizAttemptSchema.methods.calculateScore = async function() {
  const Quiz = mongoose.model('Quiz');
  const quiz = await Quiz.findById(this.quiz);
  
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  let totalPoints = 0;
  
  for (const answer of this.answers) {
    if (!answer.selectedAnswer) {
      unanswered++;
    } else if (answer.isCorrect) {
      correct++;
      totalPoints += answer.pointsEarned;
    } else {
      wrong++;
      // Apply negative marking
      if (quiz.negativeMarking > 0) {
        totalPoints -= quiz.negativeMarking;
      }
    }
  }
  
  // Handle unanswered questions
  unanswered += quiz.totalQuestions - this.answers.length;
  
  const maxPoints = quiz.totalQuestions * quiz.pointsPerQuestion;
  const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  
  this.score = {
    correct,
    wrong,
    unanswered,
    totalPoints: Math.max(0, totalPoints),  // No negative total
    maxPoints,
    percentage: Math.max(0, percentage),
    passed: percentage >= quiz.passingScore
  };
  
  return this.score;
};

// ===== POST-SAVE: Update quiz statistics =====
quizAttemptSchema.post('save', async function() {
  if (this.status === 'completed') {
    const Quiz = mongoose.model('Quiz');
    
    // Get all completed attempts for this quiz
    const attempts = await this.constructor.find({
      quiz: this.quiz,
      status: 'completed'
    });
    
    const totalAttempts = attempts.length;
    const totalCompleted = attempts.length;
    const scores = attempts.map(a => a.score.percentage);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    await Quiz.findByIdAndUpdate(this.quiz, {
      'stats.totalAttempts': totalAttempts,
      'stats.totalCompleted': totalCompleted,
      'stats.averageScore': Math.round(averageScore),
      'stats.highestScore': highestScore,
      'stats.lowestScore': lowestScore
    });
  }
});

// ===== INDEXES =====
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ quiz: 1, status: 1 });
quizAttemptSchema.index({ user: 1, status: 1 });
quizAttemptSchema.index({ completedAt: -1 });
quizAttemptSchema.index({ 'score.percentage': -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
