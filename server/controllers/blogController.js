const Blog = require('../models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const {
      category,
      relatedExam,
      tag,
      author,
      featured,
      search,
      sort = '-publishedAt',
      page = 1,
      limit = 10
    } = req.query;
    
    const query = { status: 'published' };
    
    if (category) query.category = category;
    if (relatedExam) query.relatedExam = relatedExam;
    if (tag) query.tags = { $in: [tag.toLowerCase()] };
    if (author) query.author = author;
    if (featured === 'true') query.isFeatured = true;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name avatar')
        .populate('relatedExam', 'name slug')
        .select('-content')  // Exclude full content for listing
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Blog.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: blogs
    });
  } catch (error) {
    console.error('Get Blogs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs'
    });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({
      $or: [
        { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null },
        { slug: slug }
      ],
      status: 'published'
    })
      .populate('author', 'name avatar bio')
      .populate('relatedExam', 'name slug')
      .populate({
        path: 'relatedBlogs',
        select: 'title slug excerpt featuredImage readingTime publishedAt',
        match: { status: 'published' }
      });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Increment view count
    blog.viewCount += 1;
    await blog.save();
    
    // Get auto-related blogs if none manually selected
    let relatedBlogs = blog.relatedBlogs;
    if (relatedBlogs.length === 0) {
      relatedBlogs = await Blog.getRelated(blog._id, blog.tags, 4);
    }
    
    res.json({
      success: true,
      data: {
        ...blog.toObject(),
        relatedBlogs
      }
    });
  } catch (error) {
    console.error('Get Blog Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog'
    });
  }
};

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const blogs = await Blog.find({
      status: 'published',
      isFeatured: true
    })
      .populate('author', 'name avatar')
      .select('-content')
      .sort('-publishedAt')
      .limit(limit);
    
    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Get Featured Blogs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured blogs'
    });
  }
};

// @desc    Get trending blogs
// @route   GET /api/blogs/trending
// @access  Public
const getTrendingBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const blogs = await Blog.getTrending(limit);
    
    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Get Trending Blogs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending blogs'
    });
  }
};

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private (Admin/Instructor)
const createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user._id
    };
    
    const blog = await Blog.create(blogData);
    
    await blog.populate('author', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: blog,
      message: 'Blog created successfully'
    });
  } catch (error) {
    console.error('Create Blog Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin/Author)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Regenerate slug if title changes
    if (updates.title) {
      delete updates.slug;  // Let the pre-save hook generate new slug
    }
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Check ownership (unless admin)
    if (blog.author.toString() !== req.user._id.toString() && 
        !['admin'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }
    
    Object.assign(blog, updates);
    await blog.save();
    
    await blog.populate('author', 'name avatar');
    
    res.json({
      success: true,
      data: blog,
      message: 'Blog updated successfully'
    });
  } catch (error) {
    console.error('Update Blog Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog'
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete Blog Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog'
    });
  }
};

// @desc    Like a blog
// @route   POST /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      data: { likeCount: blog.likeCount }
    });
  } catch (error) {
    console.error('Like Blog Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like blog'
    });
  }
};

// @desc    Get all tags with counts
// @route   GET /api/blogs/tags
// @access  Public
const getTags = async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get Tags Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags'
    });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getTrendingBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getTags
};
