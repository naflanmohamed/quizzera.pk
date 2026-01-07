const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const ExamAttempt = require("../models/ExamAttempt");

// @desc    Start a quiz attempt
// @route   POST /api/attempts/start
// @route   POST /api/quizzes/:quizId/attempt (Legacy)
// @access  Private
const startAttempt = async (req, res) => {
  try {
    const quizId = req.params.quizId || req.body.quizId;
    const { examAttemptId } = req.body;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    // Get quiz details
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if quiz is available
    if (quiz.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This quiz is not available",
      });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await QuizAttempt.findOne({
      user: req.user._id,
      quiz: quizId,
      status: "in_progress",
    });

    if (existingAttempt) {
      // Return existing attempt to resume
      const questions = await Question.find({ quiz: quizId, isActive: true })
        .select("-correctAnswers -explanation")
        .sort({ order: 1 });

      return res.json({
        success: true,
        message: "Resuming existing attempt",
        data: {
          attempt: existingAttempt,
          quiz,
          questions,
          timeRemaining: Math.max(
            0,
            quiz.duration * 60 -
              Math.floor((Date.now() - existingAttempt.startedAt) / 1000)
          ),
        },
      });
    }

    // Handle existing attempt link to exam if needed
    if (existingAttempt && examAttemptId) {
        const examAttempt = await ExamAttempt.findOne({ _id: examAttemptId, user: req.user._id });
        if (examAttempt) {
             const alreadyLinked = examAttempt.quizAttempts.some(qa => qa.quiz.toString() === quizId || qa.attempt.toString() === existingAttempt._id.toString());
             if (!alreadyLinked) {
                 examAttempt.quizAttempts.push({
                     quiz: quizId,
                     attempt: existingAttempt._id
                 });
                 await examAttempt.save();
             }
        }
    }

    // Get questions (without answers)
    const questions = await Question.find({ quiz: quizId, isActive: true })
      .select("-correctAnswers -explanation")
      .sort({ order: 1 });

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This quiz has no questions",
      });
    }

    // Create new attempt
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quizId,
      startedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Link to ExamAttempt if provided
    if (examAttemptId) {
        console.log('--- DEBUG START: Linking to ExamAttempt ID:', examAttemptId);
        const examAttempt = await ExamAttempt.findOne({ _id: examAttemptId, user: req.user._id });
        if (examAttempt) {
            // Check if already linked
            const alreadyLinked = examAttempt.quizAttempts.some(qa => qa.quiz.toString() === quizId || (qa.attempt && qa.attempt.toString() === attempt._id.toString()));
            console.log('--- DEBUG START: Already linked?', alreadyLinked);
            
            if (!alreadyLinked) {
                examAttempt.quizAttempts.push({
                    quiz: quizId,
                    attempt: attempt._id
                });
                await examAttempt.save();
                console.log('--- DEBUG START: Linked new attempt to ExamAttempt');
            }
        } else {
             console.log('--- DEBUG START: ExamAttempt not found for ID:', examAttemptId);
        }
    } else {
        console.log('--- DEBUG START: No examAttemptId provided in body');
    }

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
          instructions: quiz.instructions,
        },
        questions,
        timeRemaining: quiz.duration * 60, // in seconds
      },
    });
  } catch (error) {
    console.error("Start Attempt Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start quiz",
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
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found or already completed",
      });
    }

    // Find existing answer or create new
    const existingAnswerIndex = attempt.answers.findIndex(
      (a) => a.question.toString() === questionId
    );

    const answerData = {
      question: questionId,
      selectedAnswer,
      timeTaken: timeTaken || 0,
      markedForReview: markedForReview !== undefined ? markedForReview : false,
      answeredAt: new Date(),
    };

    if (existingAnswerIndex >= 0) {
      // Update existing subdocument fields individually to ensure Mongoose change tracking works
      attempt.answers[existingAnswerIndex].selectedAnswer = selectedAnswer;
      if (timeTaken) attempt.answers[existingAnswerIndex].timeTaken = timeTaken;
      if (markedForReview !== undefined) attempt.answers[existingAnswerIndex].markedForReview = markedForReview;
      attempt.answers[existingAnswerIndex].answeredAt = new Date();
    } else {
      attempt.answers.push(answerData);
    }

    await attempt.save();

    res.json({
      success: true,
      message: "Answer saved",
    });
  } catch (error) {
    console.error("Save Answer Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save answer",
    });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/attempts/:attemptId/submit
// @access  Private
const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { timeRemaining, answers } = req.body || {};

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found or already submitted",
      });
    }

    // Ensure quiz exists before processing
    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) {
       return res.status(404).json({
        success: false,
        message: "Quiz related to this attempt not found",
      });
    }

    // Update answers if provided (bulk update logic)
    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        const existingIndex = attempt.answers.findIndex(
          (a) => a.question.toString() === ans.questionId
        );

        if (existingIndex >= 0) {
          attempt.answers[existingIndex].selectedAnswer = ans.selectedAnswer;
        } else {
          attempt.answers.push({
            question: ans.questionId,
            selectedAnswer: ans.selectedAnswer,
            answeredAt: new Date(),
          });
        }
      }
    }

    // Get all questions for this quiz
    const questions = await Question.find({
      quiz: attempt.quiz,
      isActive: true,
    });

    // Calculate scores for each answer
    // Calculate scores for each answer
    for (const answer of attempt.answers) {
      const question = questions.find(
        (q) => q._id.toString() === answer.question.toString()
      );

      if (question) {
        console.log(`Checking Q: ${question._id}`);
        console.log(`User Answer:`, answer.selectedAnswer, `Type:`, typeof answer.selectedAnswer);
        console.log(`Correct Answers:`, question.correctAnswers);
        
        // Debug options if index handling is involed
        if (typeof answer.selectedAnswer === 'number') {
           console.log('Options:', question.options?.map(o => ({ id: o.id, text: o.text })));
        }

        answer.isCorrect = question.checkAnswer(answer.selectedAnswer);
        console.log(`Is Correct: ${answer.isCorrect}`);
        
        answer.pointsEarned = answer.isCorrect ? question.points || 1 : 0;
      }
    }

    // Update attempt status and timing
    attempt.status = "completed";
    attempt.completedAt = new Date();
    attempt.timeTaken = Math.floor(
      (attempt.completedAt - attempt.startedAt) / 1000
    );
    attempt.timeRemaining = timeRemaining !== undefined ? timeRemaining : 0;

    // Calculate total score using the improved method (handled mostly by logic above but calculateScore consolidates it)
    await attempt.calculateScore();

    await attempt.save();

    // UPDATE EXAM PROGRESS
    console.log('--- DEBUG SUBMIT: Attempt ID:', attempt._id);
    // Find if this attempt is part of an exam attempt
    const examAttempt = await ExamAttempt.findOne({
        'quizAttempts.attempt': attempt._id
    }).populate({
        path: 'exam',
        select: 'passResult totalMarks'
    }).populate({
        path: 'quizAttempts.attempt',
        select: 'score status'
    });

    if (examAttempt) {
        console.log('--- DEBUG SUBMIT: Found parent ExamAttempt:', examAttempt._id);
        
        let totalPoints = 0;
        let maxPoints = 0; 
        
        let completedQuizzes = 0;
        const totalQuizzes = examAttempt.quizAttempts.length;

        examAttempt.quizAttempts.forEach(qa => {
            // Debug each quiz attempt
            console.log(`--- DEBUG SUBMIT: Checking QA for Quiz ${qa.quiz}, Status: ${qa.attempt?.status}, Score:`, qa.attempt?.score);
            
            if (qa.attempt && qa.attempt.status === 'completed') {
                completedQuizzes++;
                totalPoints += (qa.attempt.score?.totalPoints || 0);
                maxPoints += (qa.attempt.score?.maxPoints || 0);
            }
        });

        console.log(`--- DEBUG SUBMIT: Stats - Completed: ${completedQuizzes}/${totalQuizzes}, Points: ${totalPoints}/${maxPoints}`);

        const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
        const passed = percentage >= (examAttempt.exam?.passResult || 40);

        examAttempt.score = {
            totalPoints,
            maxPoints,
            percentage,
            passed
        };
        
        // Force status update if needed
        if (completedQuizzes > 0 && examAttempt.status === 'in_progress') {
             // Keep as in_progress but ensure score is saved
        }

        // If all quizzes are completed, mark exam as completed
        if (completedQuizzes === totalQuizzes && totalQuizzes > 0) {
            console.log('--- DEBUG SUBMIT: Marking Exam Attempt as COMPLETED');
            examAttempt.status = 'completed';
            examAttempt.completedAt = new Date();
        }

        await examAttempt.save();
        console.log('--- DEBUG SUBMIT: Exam Attempt Saved', examAttempt.score);
    } else {
        console.log('--- DEBUG SUBMIT: No parent ExamAttempt found for assignment.');
    }

    // Get full result with questions and explanations
    const result = await QuizAttempt.findById(attemptId)
      .populate("quiz", "title passingScore")
      .populate({
        path: "answers.question",
        select: "question options correctAnswers explanation",
      });

    res.json({
      success: true,
      message: attempt.score.passed
        ? "Congratulations! You passed!"
        : "Quiz completed",
      data: result,
    });
  } catch (error) {
    console.error("Submit Attempt Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get attempt result or resume data
// @route   GET /api/attempts/:attemptId
// @access  Private
const getAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // First get the attempt without deep population to check status
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // Logic for IN PROGRESS attempts (Resume)
    if (attempt.status === "in_progress") {
      const quiz = await Quiz.findById(attempt.quiz).select(
        "title duration passingScore totalQuestions"
      );

      // Calculate real-time remaining
      const now = new Date();
      const startedAt = new Date(attempt.startedAt);
      const secondsElapsed = Math.floor((now - startedAt) / 1000);
      const totalSeconds = quiz.duration * 60;
      const timeRemaining = Math.max(0, totalSeconds - secondsElapsed);

      // If time has run out, we should auto-submit or at least tell frontend to submit
      // For now, we return 0 and let frontend handle the submit call

      // Fetch questions (securely)
      const questions = await Question.find({
        quiz: attempt.quiz,
        isActive: true,
      })
        .select("-correctAnswers -explanation")
        .sort({ order: 1 });

      // Map questions to include user's saved answers
      const questionsWithState = questions.map((q) => {
        const savedAnswer = attempt.answers.find(
          (a) => a.question.toString() === q._id.toString()
        );
        return {
          ...q.toObject(),
          savedAnswer: savedAnswer ? savedAnswer.selectedAnswer : null,
          isMarked: savedAnswer ? savedAnswer.markedForReview : false,
        };
      });

      return res.json({
        success: true,
        data: {
          attempt: {
            _id: attempt._id,
            status: attempt.status,
            startedAt: attempt.startedAt,
            timeRemaining,
            score: attempt.score, // likely empty/zeros
          },
          quiz,
          questions: questionsWithState,
        },
      });
    }

    // Logic for COMPLETED attempts (Results)
    // Re-fetch with full population for results view
    const completedAttempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
    })
      .populate("quiz", "title category duration passingScore totalQuestions") // Ensure totalQuestions is populated
      .populate({
        path: "answers.question",
        select: "question options correctAnswers explanation difficulty",
      });

    // Transform response to match frontend expectations (flatten score object)
    const result = {
      _id: completedAttempt._id,
      quiz: completedAttempt.quiz,
      status: completedAttempt.status,
      startedAt: completedAttempt.startedAt,
      completedAt: completedAttempt.completedAt,
      timeTaken: completedAttempt.timeTaken,
      
      // Flatten score properties
      percentage: completedAttempt.score?.percentage || 0,
      correctAnswers: completedAttempt.score?.correct || 0,
      incorrectAnswers: completedAttempt.score?.wrong || 0,
      skipped: completedAttempt.score?.unanswered || 0,
      totalPoints: completedAttempt.score?.totalPoints || 0,
      
      // Transform answers to helpful format
      questions: completedAttempt.answers.map(ans => ({
        _id: ans.question._id,
        questionText: ans.question.question,
        options: ans.question.options,
        explanation: ans.question.explanation,
        userAnswer: ans.selectedAnswer, // Keep raw value (index or ID)
        isCorrect: ans.isCorrect,
        pointsEarned: ans.pointsEarned
      }))
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get Attempt Result Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch result",
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
        .populate("quiz", "title category thumbnail difficulty")
        .select("score status completedAt timeTaken")
        .sort("-completedAt")
        .skip(skip)
        .limit(parseInt(limit)),
      QuizAttempt.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: attempts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      data: attempts,
    });
  } catch (error) {
    console.error("Get My Attempts Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch history",
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
      status: "completed",
    })
      .populate("user", "name avatar")
      .select("user score.percentage score.totalPoints timeTaken completedAt")
      .sort({ "score.percentage": -1, timeTaken: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get Leaderboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
};

module.exports = {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptResult,
  getMyAttempts,
  getLeaderboard,
};
