const mongoose = require('mongoose');

const EXAM_STATUS = ['draft', 'published', 'archived'];

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Exam description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    instructions: [{
      type: String
    }],
    thumbnail: {
      type: String,
      default: ''
    },
    // Array of quizzes in this exam
    quizzes: [{
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    // Total duration in minutes (sum of quiz durations or custom)
    duration: {
      type: Number,
      default: 0
    },
    // Total marks (sum of quiz marks)
    totalMarks: {
      type: Number,
      default: 0
    },
    passResult: {
      type: Number,
      default: 40 // Percentage
    },
    price: {
      type: Number,
      default: 0 // 0 for free
    },
    status: {
      type: String,
      enum: EXAM_STATUS,
      default: 'draft'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
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

// Virtual for question count (sum of questions in quizzes)
// This might be expensive to compute on every load, better to store it or aggregate when needed.
// For now, let's keep it simple.

// Pre-save to generate slug
examSchema.pre('save', async function() {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

module.exports = mongoose.model('Exam', examSchema);
