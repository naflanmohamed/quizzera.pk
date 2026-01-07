const express = require('express');
const router = express.Router();
const {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptResult,
  getMyAttempts
} = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Start a new attempt (must be before /:attemptId routes)
router.post('/start', startAttempt);

// Get user's attempt history
router.get('/my-attempts', getMyAttempts);

// Get specific attempt result
router.get('/:attemptId', getAttemptResult);

// Save answer during quiz
router.put('/:attemptId/answer', saveAnswer);

// Submit quiz
router.post('/:attemptId/submit', submitAttempt);

module.exports = router;
