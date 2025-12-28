const express = require('express');
const router = express.Router();
const {
  getPdfs,
  getPdfById,
  downloadPdf,
  createPdf,
  updatePdf,
  deletePdf,
  getResourceTypes
} = require('../controllers/pdfController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/pdfs', getPdfs);
router.get('/pdfs/types', getResourceTypes);
router.get('/pdfs/:id', getPdfById);

// Protected routes
router.post('/pdfs/:id/download', protect, downloadPdf);

// Admin/Instructor routes
router.post('/pdfs', protect, authorize('admin', 'instructor'), createPdf);
router.put('/pdfs/:id', protect, authorize('admin', 'instructor'), updatePdf);
router.delete('/pdfs/:id', protect, authorize('admin'), deletePdf);

module.exports = router;
