const mongoose = require('mongoose');

const pdfResourceSchema = new mongoose.Schema(
  {
    // PDF title
    title: {
      type: String,
      required: [true, 'PDF title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    
    // URL-friendly version
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    
    // PDF description
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Cloud storage URL (AWS S3 / Cloudinary)
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    
    // Original filename
    originalName: {
      type: String,
      required: true
    },
    
    // File size in bytes
    fileSize: {
      type: Number,
      required: true
    },
    
    // Thumbnail image URL
    thumbnail: {
      type: String,
      default: ''
    },
    
    // Category/Exam type
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    
    // Resource type
    resourceType: {
      type: String,
      enum: [
        'notes',
        'previous_paper',
        'syllabus',
        'study_material',
        'practice_set',
        'answer_key',
        'current_affairs',
        'other'
      ],
      default: 'study_material'
    },
    
    // Subject (optional)
    subject: {
      type: String,
      trim: true
    },
    
    // Year (for previous papers)
    year: {
      type: Number
    },
    
    // Tags for searching
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    
    // Is this a premium resource?
    isPremium: {
      type: Boolean,
      default: false
    },
    
    // Is this featured?
    isFeatured: {
      type: Boolean,
      default: false
    },
    
    // Download statistics
    downloadCount: {
      type: Number,
      default: 0
    },
    
    // View count
    viewCount: {
      type: Number,
      default: 0
    },
    
    // Average rating
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    
    // Who uploaded this
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Language
    language: {
      type: String,
      enum: ['english', 'hindi', 'bilingual', 'other'],
      default: 'english'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ===== VIRTUAL: Formatted file size =====
pdfResourceSchema.virtual('formattedSize').get(function() {
  const bytes = this.fileSize;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
});

// ===== PRE-SAVE: Generate slug =====
pdfResourceSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36);  // Add unique suffix
  }
  next();
});

// ===== INDEXES =====
pdfResourceSchema.index({ slug: 1 });
pdfResourceSchema.index({ category: 1, status: 1 });
pdfResourceSchema.index({ resourceType: 1 });
pdfResourceSchema.index({ tags: 1 });
pdfResourceSchema.index({ subject: 1 });
pdfResourceSchema.index({ isPremium: 1, isFeatured: 1 });
pdfResourceSchema.index({ downloadCount: -1 });

// Text index for search
pdfResourceSchema.index(
  { title: 'text', description: 'text', tags: 'text', subject: 'text' },
  { weights: { title: 10, tags: 5, subject: 3, description: 1 } }
);

module.exports = mongoose.model('PdfResource', pdfResourceSchema);
