const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private/Admin
exports.createExam = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const exam = await Exam.create(req.body);
  res.status(201).json({ success: true, data: exam });
});

// @desc    Get all exams
// @route   GET /api/exams
// @access  Public (or Private)
exports.getExams = asyncHandler(async (req, res, next) => {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
  
    // Filter by status if not admin
    // Filter by status if not admin
    if (!req.user || (req.userRole !== 'admin' && req.user.role !== 'admin')) {
        reqQuery.status = 'published';
    }
  
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
    query = Exam.find(JSON.parse(queryStr)).populate('quizzes.quiz', 'title duration');
  
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
  
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
  
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Exam.countDocuments(JSON.parse(queryStr));
  
    query = query.skip(startIndex).limit(limit);
  
    const exams = await query;
  
    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
  
    res.status(200).json({ success: true, count: exams.length, pagination, data: exams });
});

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Public
exports.getExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id)
    .populate({
        path: 'quizzes.quiz',
        select: 'title description duration totalQuestions pointsPerQuestion'
    })
    .populate('createdBy', 'name');

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: exam });
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Admin
exports.updateExam = asyncHandler(async (req, res, next) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is exam owner or admin
  if (exam.createdBy.toString() !== req.user.id && req.userRole !== 'admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this exam`, 401));
  }

  req.body.updatedBy = req.user.id;
  exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: exam });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
exports.deleteExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  if (exam.createdBy.toString() !== req.user.id && req.userRole !== 'admin' && req.user.role !== 'admin') {
     return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this exam`, 401));
  }

  await exam.remove(); // Trigger pre-remove hooks if any

  res.status(200).json({ success: true, data: {} });
});

// @desc    Start an exam attempt
// @route   POST /api/exams/:id/start
// @access  Private
exports.startExamAttempt = asyncHandler(async (req, res, next) => {
    const exam = await Exam.findById(req.params.id).populate('quizzes.quiz');
    if (!exam) {
        return next(new ErrorResponse(`Exam not found`, 404));
    }

    // Check if already in progress? Optional.
    // Create new attempt
    const attempt = await ExamAttempt.create({
        user: req.user.id,
        exam: exam._id,
        status: 'in_progress',
        score: {
            maxPoints: exam.totalMarks || 0 // Should calculate from quizzes if 0
        }
    });

    res.status(201).json({ success: true, data: attempt });
});

// @desc    Get my exam attempts
// @route   GET /api/exams/my-attempts
// @access  Private
exports.getMyExamAttempts = asyncHandler(async (req, res, next) => {
    const attempts = await ExamAttempt.find({ user: req.user.id })
        .populate({
            path: 'exam',
            populate: {
                path: 'quizzes.quiz',
                select: 'title duration totalQuestions'
            }
        })
        .populate({
            path: 'quizAttempts.quiz',
            select: 'title'
        })
        .populate({
            path: 'quizAttempts.attempt',
            select: 'status score timeTaken completedAt'
        })
        .sort('-createdAt');
    
    // Debug logging
    if (attempts.length > 0) {
        console.log('--- DEBUG getMyExamAttempts ---');
        console.log('First attempt ID:', attempts[0]._id);
        console.log('Exam field:', attempts[0].exam);
        if (attempts[0].exam) {
             console.log('Exam keys:', Object.keys(attempts[0].exam.toObject ? attempts[0].exam.toObject() : attempts[0].exam));
             console.log('Quizzes field:', attempts[0].exam.quizzes);
             console.log('Quiz Attempts:', JSON.stringify(attempts[0].quizAttempts, null, 2));
        }
    }

    res.status(200).json({ success: true, count: attempts.length, data: attempts });
});

// @desc    Submit exam attempt (finish)
// @route   PUT /api/exams/:id/submit
// @access  Private
exports.submitExamAttempt = asyncHandler(async (req, res, next) => {
    // This might be complex depending on if we submit all quizzes at once or one by one.
    // For now, let's assume this marks the exam as completed.
    
    // Logic to aggregate scores from QuizAttempts usually happens here or progressively.
    // ...
    
    res.status(200).json({ success: true, message: 'Exam submitted' }); 
});
