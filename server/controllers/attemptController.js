const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// @desc    Start a quiz attempt
// @route   POST /api/quizzes/:quizId/attempt
// @access  Private
const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Get quiz details
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if quiz is available
    if (quiz.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'This quiz is not available'
      });
    }
    
    // Check for existing in-progress attempt
    const existingAttempt = await QuizAttempt.findOne({
      user: req.user._id,
      quiz: quizId,
      status: 'in_progress'
    });
    
    if (existingAttempt) {
      // Return existing attempt to resume
      const questions = await Question.find({ quiz: quizId, isActive: true })
        .select('-correctAnswers -explanation')
        .sort({ order: 1 });
      
      return res.json({
        success: true,
        message: 'Resuming existing attempt',
        data: {
          attempt: existingAttempt,
          quiz,
          questions,
          timeRemaining: Math.max(0, (quiz.duration * 60) - 
            Math.floor((Date.now() - existingAttempt.startedAt) / 1000))
        }
      });
    }
    
    // Get questions (without answers)
    const questions = await Question.find({ quiz: quizId, isActive: true })
      .select('-correctAnswers -explanation')
      .sort({ order: 1 });
    
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This quiz has no questions'
      });
    }
    
    // Create new attempt
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quizId,
      startedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: {
        attempt,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          duration: quiz.duration,
          totalQuestions: quiz.totalQuestions,
          pointsPerQuestion: quiz.pointsPerQuestion,
          negativeMarking: quiz.negativeMarking,
          passingScore: quiz.passingScore,
          instructions: quiz.instructions
        },
        questions,
        timeRemaining: quiz.duration * 60  // in seconds
      }
    });
  } catch (error) {
    console.error('Start Attempt Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz'
    });
  }
};

// @desc    Save answer for a question
// @route   PUT /api/attempts/:attemptId/answer
// @access  Private
const saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedAnswer, timeTaken, markedForReview } = req.body;
    
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
      status: 'in_progress'
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found or already completed'
      });
    }
    
    // Find existing answer or create new
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.question.toString() === questionId
    );
    
    const answerData = {
      question: questionId,
      selectedAnswer,
      timeTaken: timeTaken || 0,
      markedForReview: markedForReview || false,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = {
        ...attempt.answers[existingAnswerIndex],
        ...answerData
      };
    } else {
      attempt.answers.push(answerData);
    }
    
    await attempt.save();
    
    res.json({
      success: true,
      message: 'Answer saved'
    });
  } catch (error) {
    console.error('Save Answer Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save answer'
    });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/attempts/:attemptId/submit
// @access  Private
const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { timeRemaining, answers } = req.body;
    
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
      status: 'in_progress'
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found or already submitted'
      });
    }
    
    // Update answers if provided
    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        const existingIndex = attempt.answers.findIndex(
          a => a.question.toString() === ans.questionId
        );
        
        if (existingIndex >= 0) {
          attempt.answers[existingIndex].selectedAnswer = ans.selectedAnswer;
        } else {
          attempt.answers.push({
            question: ans.questionId,
            selectedAnswer: ans.selectedAnswer,
            answeredAt: new Date()
          });
        }
      }
    }
    
    // Get all questions for this quiz
    const questions = await Question.find({ quiz: attempt.quiz, isActive: true });
    
    // Calculate scores for each answer
    for (const answer of attempt.answers) {
      const question = questions.find(q => q._id.toString() === answer.question.toString());
      
      if (question) {
        answer.isCorrect = question.checkAnswer(answer.selectedAnswer);
        answer.pointsEarned = answer.isCorrect ? (question.points || 1) : 0;
      }
    }
    
    // Update attempt status and timing
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.timeTaken = Math.floor((attempt.completedAt - attempt.startedAt) / 1000);
    attempt.timeRemaining = timeRemaining || 0;
    
    // Calculate total score
    await attempt.calculateScore();
    
    await attempt.save();
    
    // Get full result with questions and explanations
    const result = await QuizAttempt.findById(attemptId)
      .populate('quiz', 'title passingScore')
      .populate({
        path: 'answers.question',
        select: 'question options correctAnswers explanation'
      });
    
    res.json({
      success: true,
      message: attempt.score.passed ? 'Congratulations! You passed!' : 'Quiz completed',
      data: result
    });
  } catch (error) {
    console.error('Submit Attempt Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
};

// @desc    Get attempt result
// @route   GET /api/attempts/:attemptId
// @access  Private
const getAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user._id
    })
      .populate('quiz', 'title category duration passingScore')
      .populate({
        path: 'answers.question',
        select: 'question options correctAnswers explanation difficulty'
      });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get Attempt Result Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch result'
    });
  }
};

// @desc    Get user's quiz history
// @route   GET /api/attempts/my-history
// @access  Private
const getMyAttempts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [attempts, total] = await Promise.all([
      QuizAttempt.find(query)
        .populate('quiz', 'title category thumbnail difficulty')
        .select('score status completedAt timeTaken')
        .sort('-completedAt')
        .skip(skip)
        .limit(parseInt(limit)),
      QuizAttempt.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      count: attempts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      data: attempts
    });
  } catch (error) {
    console.error('Get My Attempts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history'
    });
  }
};

// @desc    Get leaderboard for a quiz
// @route   GET /api/quizzes/:quizId/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { limit = 10 } = req.query;
    
    const leaderboard = await QuizAttempt.find({
      quiz: quizId,
      status: 'completed'
    })
      .populate('user', 'name avatar')
      .select('user score.percentage score.totalPoints timeTaken completedAt')
      .sort({ 'score.percentage': -1, timeTaken: 1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

module.exports = {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptResult,
  getMyAttempts,
  getLeaderboard
};
