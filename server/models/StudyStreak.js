const mongoose = require('mongoose');

const studyStreakSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStudyDate: String,
  streakHistory: [{ date: String, studied: Boolean }]
}, { timestamps: true });

module.exports = mongoose.model('StudyStreak', studyStreakSchema);
