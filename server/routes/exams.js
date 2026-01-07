const express = require('express');
const {
  createExam,
  getExams,
  getExam,
  updateExam,
  deleteExam,
  startExamAttempt,
  getMyExamAttempts,
  submitExamAttempt
} = require('../controllers/examController');

const router = express.Router();

const { protect, authorize, optionalProtect } = require('../middleware/auth');

router
  .route('/')
  .get(optionalProtect, getExams)
  .post(protect, authorize('admin', 'instructor'), createExam);

router.get('/my-attempts', protect, getMyExamAttempts);

router
  .route('/:id')
  .get(getExam)
  .put(protect, authorize('admin', 'instructor'), updateExam)
  .delete(protect, authorize('admin', 'instructor'), deleteExam);

router.post('/:id/start', protect, startExamAttempt);
router.put('/:id/submit', protect, submitExamAttempt);

module.exports = router;
