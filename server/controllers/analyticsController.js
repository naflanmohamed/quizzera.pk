const QuizAttempt = require('../models/QuizAttempt');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const attempts = await QuizAttempt.find({ user: userId }).populate('quiz');
    
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
    
    const totalCorrect = attempts.reduce((sum, a) => sum + (a.obtainedMarks || 0), 0);
    const totalQuestions = attempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
    const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // Weekly progress
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayAttempts = attempts.filter(a => {
        const attemptDate = new Date(a.createdAt);
        return attemptDate >= date && attemptDate < nextDate;
      });
      
      weeklyProgress.push({
        day: days[date.getDay()],
        score: dayAttempts.length > 0 
          ? Math.round(dayAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / dayAttempts.length) 
          : 0,
        attempts: dayAttempts.length
      });
    }
    
    // Topic performance
    const topicMap = new Map();
    attempts.forEach(a => {
      const topic = a.quiz?.category?.name || a.quiz?.title || 'General';
      const existing = topicMap.get(topic) || { correct: 0, total: 0, attempts: 0 };
      existing.correct += a.obtainedMarks || 0;
      existing.total += a.totalMarks || 0;
      existing.attempts += 1;
      topicMap.set(topic, existing);
    });
    
    const topicPerformance = Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      attempts: data.attempts
    })).sort((a, b) => b.attempts - a.attempts);
    
    // Weak areas
    const weakAreas = topicPerformance
      .filter(t => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
      .map(t => ({
        topic: t.topic,
        accuracy: t.accuracy,
        recommendation: t.accuracy < 50 
          ? 'Review fundamentals and practice basic questions'
          : 'Practice more advanced questions'
      }));
    
    // Trend calculation
    const now = Date.now();
    const recentAttempts = attempts.filter(a => 
      new Date(a.createdAt) >= new Date(now - 7 * 24 * 60 * 60 * 1000)
    );
    const previousAttempts = attempts.filter(a => {
      const date = new Date(a.createdAt);
      return date >= new Date(now - 14 * 24 * 60 * 60 * 1000) &&
             date < new Date(now - 7 * 24 * 60 * 60 * 1000);
    });
    
    const recentAvg = recentAttempts.length > 0 
      ? recentAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / recentAttempts.length 
      : 0;
    const prevAvg = previousAttempts.length > 0 
      ? previousAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / previousAttempts.length 
      : 0;
    
    let recentTrend = 'stable';
    if (recentAvg > prevAvg + 5) recentTrend = 'up';
    else if (recentAvg < prevAvg - 5) recentTrend = 'down';
    
    // Calculate study hours from timeTaken (in seconds)
    const totalStudySeconds = attempts.reduce((s, a) => s + (a.timeTaken || 0), 0);
    const totalStudyHours = Math.round(totalStudySeconds / 3600);
    
    res.json({
      success: true,
      data: {
        totalAttempts,
        averageScore,
        averageAccuracy,
        totalStudyHours,
        rank: 1,
        testsCompleted: totalAttempts,
        topicPerformance,
        weeklyProgress,
        weakAreas,
        recentTrend
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};
