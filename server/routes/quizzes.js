const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  getFeaturedQuizzes,
  getPopularQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz
} = require('../controllers/quizController');
const {
  getQuestions,
  createQuestion,
  bulkCreateQuestions,
  reorderQuestions
} = require('../controllers/questionController');
const {
  startAttempt,
  getLeaderboard
} = require('../controllers/attemptController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getQuizzes);
router.get('/featured', getFeaturedQuizzes);
router.get('/popular', getPopularQuizzes);
router.get('/:id', getQuizById);
router.get('/:quizId/leaderboard', getLeaderboard);

// Protected routes - Quiz CRUD
router.post('/', protect, authorize('admin', 'instructor'), createQuiz);
router.put('/:id', protect, authorize('admin', 'instructor'), updateQuiz);
router.delete('/:id', protect, authorize('admin'), deleteQuiz);
router.put('/:id/publish', protect, authorize('admin', 'instructor'), publishQuiz);

// Protected routes - Questions
router.get('/:quizId/questions', protect, getQuestions);
router.post('/:quizId/questions', protect, authorize('admin', 'instructor'), createQuestion);
router.post('/:quizId/questions/bulk', protect, authorize('admin', 'instructor'), bulkCreateQuestions);
router.put('/:quizId/questions/reorder', protect, authorize('admin', 'instructor'), reorderQuestions);

// Protected routes - Attempts
router.post('/:quizId/attempt', protect, startAttempt);

module.exports = router;
