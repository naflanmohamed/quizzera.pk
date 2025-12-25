const mongoose = require('mongoose');

// Define available roles
const ROLES = ['user', 'instructor', 'mentor', 'admin'];

const userRoleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to User
      ref: 'User',  // Which model to reference
      required: true
    },
    role: {
      type: String,
      enum: ROLES,  // Only allow these values
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure a user can't have the same role twice
userRoleSchema.index({ userId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('UserRole', userRoleSchema);
