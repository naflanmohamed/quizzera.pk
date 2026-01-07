const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    // References to individual quiz attempts
    quizAttempts: [{
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        },
        attempt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuizAttempt'
        }
    }],
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned', 'timed_out'],
      default: 'in_progress'
    },
    score: {
      totalPoints: { type: Number, default: 0 },
      maxPoints: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      passed: { type: Boolean, default: false }
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    currentQuizIndex: {
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

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
