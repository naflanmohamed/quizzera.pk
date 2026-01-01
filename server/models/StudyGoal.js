const mongoose = require('mongoose');

const studyGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['daily_questions', 'weekly_hours', 'monthly_tests', 'target_score'], required: true },
  title: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  deadline: Date,
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('StudyGoal', studyGoalSchema);
