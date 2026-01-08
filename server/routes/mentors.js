const express = require('express');
const router = express.Router();
const {
  applyMentor,
  getMentors,
  getMentorById,
  getApplications,
  updateApplicationStatus,
  deleteMentor
} = require('../controllers/mentorController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getMentors);
router.get('/:id', getMentorById);

// Protected routes
router.post('/apply', protect, applyMentor);

// Admin routes
router.get('/admin/applications', protect, authorize('admin'), getApplications);
router.put('/admin/applications/:id', protect, authorize('admin'), updateApplicationStatus);
router.delete('/admin/applications/:id', protect, authorize('admin'), deleteMentor);

module.exports = router;
