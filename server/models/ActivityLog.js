const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['quiz_completed', 'goal_achieved', 'streak_milestone', 'badge_earned'], required: true },
  title: { type: String, required: true },
  description: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
