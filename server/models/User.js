const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Define the structure of a User document
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'], // Error message if missing
      trim: true, // Remove whitespace
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // No duplicate emails
      lowercase: true, // Convert to lowercase
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: 'default-avatar.png',
    },
    phone: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
)

// ===== MIDDLEWARE: Hash password before saving =====
// 'pre' means "before" - this runs before the document is saved
userSchema.pre('save', async function () {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    return // Skip to next middleware
  }

  // Generate salt (random string to add to password)
  const salt = await bcrypt.genSalt(10)

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt)
})

// ===== METHOD: Compare entered password with hashed password =====
userSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare() compares plain text with hashed password
  return await bcrypt.compare(enteredPassword, this.password)
}

// Create and export the model
module.exports = mongoose.model('User', userSchema)
