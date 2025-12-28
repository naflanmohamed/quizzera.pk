const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes (Admin/Instructor only)
router.post('/', protect, authorize('admin', 'instructor'), createCategory);
router.put('/:id', protect, authorize('admin', 'instructor'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
