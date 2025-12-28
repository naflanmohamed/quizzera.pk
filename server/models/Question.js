const mongoose = require('mongoose');

// Question types
const QUESTION_TYPES = [
  'single',      // Single correct answer (MCQ)
  'multiple',    // Multiple correct answers
  'true_false',  // True or False
  'fill_blank'   // Fill in the blank
];

const questionSchema = new mongoose.Schema(
  {
    // Which quiz this question belongs to
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required']
    },
    
    // Question text (supports HTML/Markdown)
    question: {
      type: String,
      required: [true, 'Question text is required'],
      maxlength: [2000, 'Question cannot exceed 2000 characters']
    },
    
    // Question type
    type: {
      type: String,
      enum: QUESTION_TYPES,
      default: 'single'
    },
    
    // Answer options
    options: [{
      // Option identifier (A, B, C, D or 1, 2, 3, 4)
      id: {
        type: String,
        required: true
      },
      // Option text
      text: {
        type: String,
        required: true
      },
      // Is this the correct answer?
      isCorrect: {
        type: Boolean,
        default: false
      }
    }],
    
    // Correct answer(s) - array for multiple correct answers
    correctAnswers: [{
      type: String,
      required: true
    }],
    
    // Explanation shown after answering
    explanation: {
      type: String,
      maxlength: [2000, 'Explanation cannot exceed 2000 characters']
    },
    
    // Question image (optional)
    image: {
      type: String,
      default: ''
    },
    
    // Difficulty (overrides quiz difficulty for this question)
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium'
    },
    
    // Points for this question (overrides quiz default)
    points: {
      type: Number,
      default: 1,
      min: 0
    },
    
    // Order in the quiz
    order: {
      type: Number,
      default: 0
    },
    
    // Tags for filtering/searching
    tags: [{
      type: String,
      trim: true
    }],
    
    // Subject/Topic within the category
    subject: {
      type: String,
      trim: true
    },
    
    // Statistics
    stats: {
      timesAnswered: { type: Number, default: 0 },
      timesCorrect: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }  // in seconds
    },
    
    // Is this question active?
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Who created this question
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// ===== VIRTUAL: Calculate success rate =====
questionSchema.virtual('successRate').get(function() {
  if (this.stats.timesAnswered === 0) return 0;
  return Math.round((this.stats.timesCorrect / this.stats.timesAnswered) * 100);
});

// ===== METHOD: Check if answer is correct =====
questionSchema.methods.checkAnswer = function(userAnswer) {
  // For single choice
  if (this.type === 'single' || this.type === 'true_false') {
    return this.correctAnswers.includes(userAnswer);
  }
  
  // For multiple choice - all answers must match
  if (this.type === 'multiple') {
    if (!Array.isArray(userAnswer)) return false;
    
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...this.correctAnswers].sort();
    
    if (sortedUser.length !== sortedCorrect.length) return false;
    
    return sortedUser.every((ans, idx) => ans === sortedCorrect[idx]);
  }
  
  // For fill in blank - case insensitive comparison
  if (this.type === 'fill_blank') {
    return this.correctAnswers.some(
      correct => correct.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    );
  }
  
  return false;
};

// ===== POST-SAVE: Update quiz question count =====
questionSchema.post('save', async function() {
  const Quiz = mongoose.model('Quiz');
  const count = await this.constructor.countDocuments({ quiz: this.quiz, isActive: true });
  await Quiz.findByIdAndUpdate(this.quiz, { totalQuestions: count });
});

// ===== POST-REMOVE: Update quiz question count =====
questionSchema.post('remove', async function() {
  const Quiz = mongoose.model('Quiz');
  const count = await this.constructor.countDocuments({ quiz: this.quiz, isActive: true });
  await Quiz.findByIdAndUpdate(this.quiz, { totalQuestions: count });
});

// ===== INDEXES =====
questionSchema.index({ quiz: 1, order: 1 });
questionSchema.index({ quiz: 1, isActive: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ subject: 1 });

module.exports = mongoose.model('Question', questionSchema);
