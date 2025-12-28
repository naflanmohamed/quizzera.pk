const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    // Blog title
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    
    // URL-friendly version
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    
    // Short excerpt for previews
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    
    // Full blog content (HTML/Markdown)
    content: {
      type: String,
      required: [true, 'Blog content is required']
    },
    
    // Featured image
    featuredImage: {
      type: String,
      default: ''
    },
    
    // Blog category
    category: {
      type: String,
      enum: [
        'exam_tips',
        'study_strategies',
        'current_affairs',
        'success_stories',
        'exam_updates',
        'career_guidance',
        'subject_guide',
        'news',
        'other'
      ],
      default: 'other'
    },
    
    // Related exam category
    relatedExam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    
    // Tags
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    
    // Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Co-authors (optional)
    coAuthors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    // Publication status
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft'
    },
    
    // Scheduled publish date
    publishedAt: {
      type: Date
    },
    
    // Is this featured?
    isFeatured: {
      type: Boolean,
      default: false
    },
    
    // Is this pinned to top?
    isPinned: {
      type: Boolean,
      default: false
    },
    
    // Statistics
    viewCount: {
      type: Number,
      default: 0
    },
    
    likeCount: {
      type: Number,
      default: 0
    },
    
    shareCount: {
      type: Number,
      default: 0
    },
    
    commentCount: {
      type: Number,
      default: 0
    },
    
    // Reading time in minutes (calculated)
    readingTime: {
      type: Number,
      default: 1
    },
    
    // SEO metadata
    seo: {
      metaTitle: { type: String, maxlength: 60 },
      metaDescription: { type: String, maxlength: 160 },
      keywords: [{ type: String }]
    },
    
    // Related blogs (manual selection)
    relatedBlogs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }],
    
    // Allow comments?
    allowComments: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ===== PRE-SAVE: Generate slug, excerpt, and reading time =====
blogSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36);
  }
  
  // Generate excerpt from content
  if (this.isModified('content') && !this.excerpt) {
    // Strip HTML tags and get first 200 characters
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 200) + '...';
  }
  
  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const plainText = this.content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  
  // Set published date if publishing
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// ===== INDEXES =====
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isFeatured: 1, isPinned: 1 });
blogSchema.index({ viewCount: -1 });

// Text index for search
blogSchema.index(
  { title: 'text', content: 'text', tags: 'text', excerpt: 'text' },
  { weights: { title: 10, tags: 5, excerpt: 3, content: 1 } }
);

// ===== STATIC: Get trending blogs =====
blogSchema.statics.getTrending = function(limit = 5) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'published',
    publishedAt: { $gte: oneWeekAgo }
  })
    .sort({ viewCount: -1 })
    .limit(limit)
    .populate('author', 'name avatar');
};

// ===== STATIC: Get related blogs =====
blogSchema.statics.getRelated = function(blogId, tags, limit = 4) {
  return this.find({
    _id: { $ne: blogId },
    status: 'published',
    tags: { $in: tags }
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name avatar');
};

module.exports = mongoose.model('Blog', blogSchema);
