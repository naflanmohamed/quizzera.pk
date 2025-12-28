const express = require('express');
const router = express.Router();
const {
  getQuestionById,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected (Admin/Instructor only)
router.get('/:id', protect, authorize('admin', 'instructor'), getQuestionById);
router.put('/:id', protect, authorize('admin', 'instructor'), updateQuestion);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteQuestion);

module.exports = router;
