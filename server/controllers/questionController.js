const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// @desc    Get questions for a quiz
// @route   GET /api/quizzes/:quizId/questions
// @access  Private (must be taking quiz or admin)
const getQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { includeAnswers } = req.query;
    
    // Check if user is admin/instructor
    const isAdmin = req.user && ['admin', 'instructor'].includes(req.userRole);
    
    // Select fields based on role
    let selectFields = '-__v';
    if (!isAdmin && includeAnswers !== 'true') {
      selectFields += ' -correctAnswers -explanation';
    }
    
    const questions = await Question.find({ quiz: quizId, isActive: true })
      .select(selectFields)
      .sort({ order: 1 });
    
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Get Questions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private (Admin/Instructor)
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id).populate('quiz', 'title');
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get Question Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question'
    });
  }
};

// @desc    Create question
// @route   POST /api/quizzes/:quizId/questions
// @access  Private (Admin/Instructor)
const createQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Get current question count for order
    const questionCount = await Question.countDocuments({ quiz: quizId });
    
    const questionData = {
      ...req.body,
      quiz: quizId,
      order: req.body.order || questionCount + 1,
      createdBy: req.user._id
    };
    
    // Validate options have correct answers marked
    const hasCorrectAnswer = questionData.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      return res.status(400).json({
        success: false,
        message: 'At least one option must be marked as correct'
      });
    }
    
    // Extract correct answers from options
    questionData.correctAnswers = questionData.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.id);
    
    const question = await Question.create(questionData);
    
    res.status(201).json({
      success: true,
      data: question,
      message: 'Question created successfully'
    });
  } catch (error) {
    console.error('Create Question Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Admin/Instructor)
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If options are updated, recalculate correct answers
    if (updates.options) {
      updates.correctAnswers = updates.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);
    }
    
    const question = await Question.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      data: question,
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('Update Question Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question'
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Admin/Instructor)
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findByIdAndDelete(id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Reorder remaining questions
    await Question.updateMany(
      { quiz: question.quiz, order: { $gt: question.order } },
      { $inc: { order: -1 } }
    );
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question'
    });
  }
};

// @desc    Bulk create questions
// @route   POST /api/quizzes/:quizId/questions/bulk
// @access  Private (Admin/Instructor)
const bulkCreateQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of questions'
      });
    }
    
    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Get current question count
    let currentOrder = await Question.countDocuments({ quiz: quizId });
    
    // Prepare questions
    const preparedQuestions = questions.map((q, index) => ({
      ...q,
      quiz: quizId,
      order: currentOrder + index + 1,
      createdBy: req.user._id,
      correctAnswers: q.options.filter(opt => opt.isCorrect).map(opt => opt.id)
    }));
    
    // Insert all questions
    const createdQuestions = await Question.insertMany(preparedQuestions);
    
    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      data: createdQuestions,
      message: `${createdQuestions.length} questions created successfully`
    });
  } catch (error) {
    console.error('Bulk Create Questions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create questions',
      error: error.message
    });
  }
};

// @desc    Reorder questions
// @route   PUT /api/quizzes/:quizId/questions/reorder
// @access  Private (Admin/Instructor)
const reorderQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { orderMap } = req.body;  // { questionId: newOrder, ... }
    
    // Update each question's order
    const updatePromises = Object.entries(orderMap).map(([questionId, newOrder]) =>
      Question.findByIdAndUpdate(questionId, { order: newOrder })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Questions reordered successfully'
    });
  } catch (error) {
    console.error('Reorder Questions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder questions'
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  reorderQuestions
};
