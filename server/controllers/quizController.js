const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      status = 'published',
      featured,
      premium,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;
    
    // Build query
    const query = {};
    
    // Only show published quizzes to non-admin users
    if (!req.user || !['admin', 'instructor'].includes(req.userRole)) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured === 'true') query.isFeatured = true;
    if (premium === 'true') query.isPremium = true;
    if (premium === 'false') query.isPremium = false;
    
    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .populate('category', 'name slug icon')
        .populate('createdBy', 'name avatar')
        .select('-__v')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Quiz.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      count: quizzes.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: quizzes
    });
  } catch (error) {
    console.error('Get Quizzes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes'
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const { withQuestions } = req.query;
    
    // Find by ID or slug
    let quiz = await Quiz.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { slug: id }
      ]
    })
      .populate('category', 'name slug icon')
      .populate('createdBy', 'name avatar');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Get questions if requested (without correct answers for students)
    let questions = [];
    if (withQuestions === 'true') {
      const selectFields = req.user && ['admin', 'instructor'].includes(req.userRole)
        ? ''  // Include all fields for admin/instructor
        : '-correctAnswers -explanation';  // Hide answers for students
      
      questions = await Question.find({ quiz: quiz._id, isActive: true })
        .select(selectFields)
        .sort({ order: 1 });
    }
    
    // Get user's previous attempts if logged in
    let userAttempts = [];
    if (req.user) {
      userAttempts = await QuizAttempt.find({
        user: req.user._id,
        quiz: quiz._id
      })
        .select('score status completedAt timeTaken')
        .sort('-completedAt')
        .limit(5);
    }
    
    res.json({
      success: true,
      data: {
        ...quiz.toObject(),
        questions,
        userAttempts
      }
    });
  } catch (error) {
    console.error('Get Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
};

// @desc    Get featured quizzes
// @route   GET /api/quizzes/featured
// @access  Public
const getFeaturedQuizzes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const quizzes = await Quiz.getFeatured(limit);
    
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get Featured Quizzes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured quizzes'
    });
  }
};

// @desc    Get popular quizzes
// @route   GET /api/quizzes/popular
// @access  Public
const getPopularQuizzes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const quizzes = await Quiz.getPopular(limit);
    
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get Popular Quizzes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular quizzes'
    });
  }
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private (Admin/Instructor)
const createQuiz = async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const quiz = await Quiz.create(quizData);
    
    // Populate for response
    await quiz.populate('category', 'name slug icon');
    
    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    console.error('Create Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Admin/Instructor)
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    // Don't allow changing slug
    delete updates.slug;
    
    const quiz = await Quiz.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug icon');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.json({
      success: true,
      data: quiz,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    console.error('Update Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz'
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin)
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for existing attempts
    const attemptCount = await QuizAttempt.countDocuments({ quiz: id });
    if (attemptCount > 0) {
      // Archive instead of delete
      await Quiz.findByIdAndUpdate(id, { status: 'archived' });
      return res.json({
        success: true,
        message: 'Quiz has attempts. It has been archived instead of deleted.'
      });
    }
    
    // Delete all questions first
    await Question.deleteMany({ quiz: id });
    
    // Delete quiz
    const quiz = await Quiz.findByIdAndDelete(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Quiz and all its questions deleted successfully'
    });
  } catch (error) {
    console.error('Delete Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz'
    });
  }
};

// @desc    Publish quiz
// @route   PUT /api/quizzes/:id/publish
// @access  Private (Admin/Instructor)
const publishQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if quiz has questions
    if (quiz.totalQuestions < 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish quiz without questions. Add at least one question.'
      });
    }
    
    quiz.status = 'published';
    quiz.updatedBy = req.user._id;
    await quiz.save();
    
    res.json({
      success: true,
      data: quiz,
      message: 'Quiz published successfully'
    });
  } catch (error) {
    console.error('Publish Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish quiz'
    });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  getFeaturedQuizzes,
  getPopularQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz
};
