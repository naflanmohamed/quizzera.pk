const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    // Category name (e.g., "UPSC", "SSC CGL", "Banking")
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    
    // URL-friendly version of name (e.g., "upsc", "ssc-cgl")
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    
    // Category description
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    // Category icon (emoji or icon name)
    icon: {
      type: String,
      default: '📚'
    },
    
    // Category image URL
    image: {
      type: String,
      default: ''
    },
    
    // Category color for UI
    color: {
      type: String,
      default: '#3B82F6' // Blue
    },
    
    // Parent category (for subcategories)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    
    // Is this category active?
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Display order
    order: {
      type: Number,
      default: 0
    },
    
    // Who created this category
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    // Enable virtual fields in JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ===== VIRTUAL: Get subcategories =====
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// ===== VIRTUAL: Get quiz count =====
categorySchema.virtual('quizCount', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// ===== PRE-SAVE: Generate slug from name =====
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, '');      // Remove leading/trailing dashes
  }
  next();
});

// ===== INDEX: For faster queries =====
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Category', categorySchema);
