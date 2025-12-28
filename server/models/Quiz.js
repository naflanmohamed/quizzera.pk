const mongoose = require('mongoose');

// Define difficulty levels
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert'];

// Define quiz status
const QUIZ_STATUS = ['draft', 'published', 'archived'];

const quizSchema = new mongoose.Schema(
  {
    // Quiz title
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    
    // URL-friendly version
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    
    // Quiz description
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    
    // Short description for cards
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters']
    },
    
    // Quiz category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    
    // Quiz thumbnail image
    thumbnail: {
      type: String,
      default: ''
    },
    
    // Difficulty level
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: 'medium'
    },
    
    // Time limit in minutes (0 = no limit)
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [300, 'Duration cannot exceed 300 minutes']
    },
    
    // Total questions count (updated automatically)
    totalQuestions: {
      type: Number,
      default: 0
    },
    
    // Points per correct answer
    pointsPerQuestion: {
      type: Number,
      default: 1
    },
    
    // Negative marking per wrong answer (0 = no negative)
    negativeMarking: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Passing percentage
    passingScore: {
      type: Number,
      default: 40,
      min: 0,
      max: 100
    },
    
    // Quiz status
    status: {
      type: String,
      enum: QUIZ_STATUS,
      default: 'draft'
    },
    
    // Is this a premium quiz?
    isPremium: {
      type: Boolean,
      default: false
    },
    
    // Is this a featured quiz?
    isFeatured: {
      type: Boolean,
      default: false
    },
    
    // Tags for searching
    tags: [{
      type: String,
      trim: true
    }],
    
    // Instructions shown before starting
    instructions: [{
      type: String
    }],
    
    // Quiz statistics
    stats: {
      totalAttempts: { type: Number, default: 0 },
      totalCompleted: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
      lowestScore: { type: Number, default: 0 }
    },
    
    // Scheduling
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    
    // Who created this quiz
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Last updated by
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ===== VIRTUAL: Get questions =====
quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quiz'
});

// ===== VIRTUAL: Check if quiz is available =====
quizSchema.virtual('isAvailable').get(function() {
  const now = new Date();
  
  // Check if published
  if (this.status !== 'published') return false;
  
  // Check start date
  if (this.startDate && now < this.startDate) return false;
  
  // Check end date
  if (this.endDate && now > this.endDate) return false;
  
  return true;
});

// ===== PRE-SAVE: Generate slug and excerpt =====
quizSchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Generate excerpt from description
  if (this.isModified('description') && !this.excerpt) {
    this.excerpt = this.description.substring(0, 297) + '...';
  }
  
  next();
});

// ===== INDEXES =====
quizSchema.index({ slug: 1 });
quizSchema.index({ category: 1, status: 1 });
quizSchema.index({ status: 1, isFeatured: -1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ 'stats.totalAttempts': -1 });

// ===== STATIC METHOD: Get popular quizzes =====
quizSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'stats.totalAttempts': -1 })
    .limit(limit)
    .populate('category', 'name slug icon');
};

// ===== STATIC METHOD: Get featured quizzes =====
quizSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ status: 'published', isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug icon');
};

module.exports = mongoose.model('Quiz', quizSchema);
