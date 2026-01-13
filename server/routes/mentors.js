const express = require('express');
const router = express.Router();
const {
  applyMentor,
  getMentors,
  getMentorById,
  getApplications,
  updateApplicationStatus,

  deleteMentor,
  getMine
} = require('../controllers/mentorController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getMentors);


// Protected routes
router.get('/me', protect, getMine);
router.post('/apply', protect, applyMentor);
router.get('/:id', getMentorById);

// Admin routes
router.get('/admin/applications', protect, authorize('admin'), getApplications);
router.put('/admin/applications/:id', protect, authorize('admin'), updateApplicationStatus);
router.delete('/admin/applications/:id', protect, authorize('admin'), deleteMentor);

module.exports = router;
