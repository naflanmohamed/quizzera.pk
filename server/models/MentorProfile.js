const mongoose = require('mongoose');

const mentorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    required: [true, 'Please add a short bio'],
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  expertise: {
    type: [String],
    required: true,
    validate: [arrayLimit, 'Please add at least one area of expertise']
  },
  experience: {
    type: String,
    required: [true, 'Please add your experience']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please add your hourly rate']
  },
  availability: {
    type: String, // Can be text description or JSON string for structured availability
    default: 'Contact for availability'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  linkedin: {
    type: String
  },
  portfolio: {
    type: String
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

function arrayLimit(val) {
  return val.length > 0;
}

module.exports = mongoose.model('MentorProfile', mentorProfileSchema);
