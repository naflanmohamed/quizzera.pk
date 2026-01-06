const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getTrendingBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getTags
} = require('../controllers/blogController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

// Public routes
router.get('/', getBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/trending', getTrendingBlogs);
router.get('/tags', getTags);
router.get('/:slug', optionalProtect, getBlogBySlug);

// Protected routes
router.post('/:id/like', protect, likeBlog);

// Admin/Instructor routes
router.post('/', protect, authorize('admin', 'instructor'), createBlog);
router.put('/:id', protect, authorize('admin', 'instructor'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
