const express = require('express');
const router = express.Router();
const {
  saveAnswer,
  submitAttempt,
  getAttemptResult,
  getMyAttempts
} = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get user's attempt history
router.get('/my-history', getMyAttempts);

// Get specific attempt result
router.get('/:attemptId', getAttemptResult);

// Save answer during quiz
router.put('/:attemptId/answer', saveAnswer);

// Submit quiz
router.post('/:attemptId/submit', submitAttempt);

module.exports = router;
