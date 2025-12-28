const PdfResource = require('../models/PdfResource');

// @desc    Get all PDFs
// @route   GET /api/resources/pdfs
// @access  Public
const getPdfs = async (req, res) => {
  try {
    const {
      category,
      resourceType,
      subject,
      year,
      premium,
      featured,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;
    
    // Build query
    const query = { status: 'published' };
    
    if (category) query.category = category;
    if (resourceType) query.resourceType = resourceType;
    if (subject) query.subject = subject;
    if (year) query.year = parseInt(year);
    if (premium === 'true') query.isPremium = true;
    if (premium === 'false') query.isPremium = false;
    if (featured === 'true') query.isFeatured = true;
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [pdfs, total] = await Promise.all([
      PdfResource.find(query)
        .populate('category', 'name slug icon')
        .populate('uploadedBy', 'name avatar')
        .select('-__v')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      PdfResource.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      count: pdfs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: pdfs
    });
  } catch (error) {
    console.error('Get PDFs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PDFs'
    });
  }
};

// @desc    Get single PDF
// @route   GET /api/resources/pdfs/:id
// @access  Public
const getPdfById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pdf = await PdfResource.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { slug: id }
      ]
    })
      .populate('category', 'name slug icon')
      .populate('uploadedBy', 'name avatar');
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }
    
    // Increment view count
    pdf.viewCount += 1;
    await pdf.save();
    
    res.json({
      success: true,
      data: pdf
    });
  } catch (error) {
    console.error('Get PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PDF'
    });
  }
};

// @desc    Download PDF (increment counter)
// @route   POST /api/resources/pdfs/:id/download
// @access  Private
const downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pdf = await PdfResource.findById(id);
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }
    
    // Check premium access
    if (pdf.isPremium && !req.user?.hasPremium) {
      return res.status(403).json({
        success: false,
        message: 'This is a premium resource. Please upgrade to access.'
      });
    }
    
    // Increment download count
    pdf.downloadCount += 1;
    await pdf.save();
    
    res.json({
      success: true,
      data: {
        fileUrl: pdf.fileUrl,
        originalName: pdf.originalName
      }
    });
  } catch (error) {
    console.error('Download PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get download link'
    });
  }
};

// @desc    Create PDF
// @route   POST /api/resources/pdfs
// @access  Private (Admin/Instructor)
const createPdf = async (req, res) => {
  try {
    const pdfData = {
      ...req.body,
      uploadedBy: req.user._id
    };
    
    const pdf = await PdfResource.create(pdfData);
    
    await pdf.populate('category', 'name slug icon');
    
    res.status(201).json({
      success: true,
      data: pdf,
      message: 'PDF uploaded successfully'
    });
  } catch (error) {
    console.error('Create PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload PDF',
      error: error.message
    });
  }
};

// @desc    Update PDF
// @route   PUT /api/resources/pdfs/:id
// @access  Private (Admin/Instructor)
const updatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    delete updates.slug;
    delete updates.downloadCount;
    delete updates.viewCount;
    
    const pdf = await PdfResource.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug icon');
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }
    
    res.json({
      success: true,
      data: pdf,
      message: 'PDF updated successfully'
    });
  } catch (error) {
    console.error('Update PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update PDF'
    });
  }
};

// @desc    Delete PDF
// @route   DELETE /api/resources/pdfs/:id
// @access  Private (Admin)
const deletePdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pdf = await PdfResource.findByIdAndDelete(id);
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }
    
    // TODO: Delete file from cloud storage
    
    res.json({
      success: true,
      message: 'PDF deleted successfully'
    });
  } catch (error) {
    console.error('Delete PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete PDF'
    });
  }
};

// @desc    Get resource types with counts
// @route   GET /api/resources/pdfs/types
// @access  Public
const getResourceTypes = async (req, res) => {
  try {
    const types = await PdfResource.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$resourceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Get Resource Types Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource types'
    });
  }
};

module.exports = {
  getPdfs,
  getPdfById,
  downloadPdf,
  createPdf,
  updatePdf,
  deletePdf,
  getResourceTypes
};
