const User = require('../models/User')
const UserRole = require('../models/UserRole')
const generateToken = require('../utils/generateToken')

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      })
    }

    // Create user (password gets hashed automatically by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
    })

    // Assign default 'user' role
    await UserRole.create({
      userId: user._id,
      role: 'user',
    })

    // Generate token
    const token = generateToken(user._id)

    // Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        roles: ['user'],
      },
    })
  } catch (error) {
    console.error('Register Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check for email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find user and include password (normally excluded)
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Get user roles
    const userRoles = await UserRole.find({ userId: user._id })
    const roles = userRoles.map((ur) => ur.role)

    // Generate token
    const token = generateToken(user._id)

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        roles,
      },
    })
  } catch (error) {
    console.error('Login Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    })
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id)

    // Get user roles
    const userRoles = await UserRole.find({ userId: user._id })
    const roles = userRoles.map((ur) => ur.role)

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        roles,
      },
    })
  } catch (error) {
    console.error('GetMe Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body

    const user = await User.findById(req.user.id)

    if (user) {
      user.name = name || user.name
      user.email = email || user.email
      user.phone = phone || user.phone

      const updatedUser = await user.save()

      // Get user roles
      const userRoles = await UserRole.find({ userId: user._id })
      const roles = userRoles.map((ur) => ur.role)

      res.json({
        success: true,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          phone: updatedUser.phone,
          roles,
        },
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }
  } catch (error) {
    console.error('UpdateProfile Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
}
