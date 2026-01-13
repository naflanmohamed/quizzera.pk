const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const asyncHandler = require('express-async-handler');

// @desc    Apply to become a mentor
// @route   POST /api/mentors/apply
// @access  Private
exports.applyMentor = asyncHandler(async (req, res) => {
  const { bio, expertise, experience, hourlyRate, linkedin, portfolio, availability } = req.body;

  // Check if already applied
  const existingProfile = await MentorProfile.findOne({ user: req.user.id });
  if (existingProfile) {
    if (existingProfile.status === 'pending') {
      res.status(400);
      throw new Error('You have already applied. Please wait for approval.');
    }
    if (existingProfile.status === 'approved') {
      res.status(400);
      throw new Error('You are already a mentor.');
    }
    
    // If rejected, allow re-apply by updating the existing profile
    if (existingProfile.status === 'rejected') {
        existingProfile.bio = bio;
        existingProfile.expertise = expertise;
        existingProfile.experience = experience;
        existingProfile.hourlyRate = hourlyRate;
        existingProfile.linkedin = linkedin;
        existingProfile.portfolio = portfolio;
        existingProfile.availability = availability;
        existingProfile.status = 'pending';
        
        const updatedProfile = await existingProfile.save();
        
        res.status(200).json({
            success: true,
            data: updatedProfile
        });
        return;
    }
  }

  const mentorProfile = await MentorProfile.create({
    user: req.user.id,
    bio,
    expertise,
    experience,
    hourlyRate,
    linkedin,
    portfolio,
    availability,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: mentorProfile
  });
});

// @desc    Get all active mentors
// @route   GET /api/mentors
// @access  Public
exports.getMentors = asyncHandler(async (req, res) => {
  const { expertise, minRate, maxRate, search } = req.query;

  let query = { status: 'approved' };

  if (expertise) {
    query.expertise = { $in: [expertise] };
  }

  if (minRate || maxRate) {
    query.hourlyRate = {};
    if (minRate) query.hourlyRate.$gte = minRate;
    if (maxRate) query.hourlyRate.$lte = maxRate;
  }

  if (search) {
     const userIds = await User.find({ name: { $regex: search, $options: 'i' } }).distinct('_id');
     query.$or = [
         { user: { $in: userIds } },
         { bio: { $regex: search, $options: 'i' } },
         { expertise: { $regex: search, $options: 'i' } }
     ];
  }

  const mentors = await MentorProfile.find(query).populate('user', 'name avatar email');

  res.status(200).json({
    success: true,
    count: mentors.length,
    data: mentors
  });
});

// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentorById = asyncHandler(async (req, res) => {
  const mentor = await MentorProfile.findById(req.params.id).populate('user', 'name avatar email');

  if (!mentor) {
    res.status(404);
    throw new Error('Mentor not found');
  }

  res.status(200).json({
    success: true,
    data: mentor
  });
});

// @desc    Get all mentor applications (Admin)
// @route   GET /api/mentors/applications
// @access  Private/Admin
exports.getApplications = asyncHandler(async (req, res) => {
  const applications = await MentorProfile.find({}).populate('user', 'name email avatar');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc    Update application status (Admin)
// @route   PUT /api/mentors/applications/:id
// @access  Private/Admin
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  
  if (!['approved', 'rejected'].includes(status)) {
     res.status(400);
     throw new Error('Invalid status');
  }

  const mentorProfile = await MentorProfile.findById(req.params.id);

  if (!mentorProfile) {
    res.status(404);
    throw new Error('Application not found');
  }

  mentorProfile.status = status;
  await mentorProfile.save();

  // If approved, add role 'mentor' to user
  if (status === 'approved') {
    // Check if role exists
    const roleExists = await UserRole.findOne({ userId: mentorProfile.user, role: 'mentor' });
    if (!roleExists) {
        await UserRole.create({ userId: mentorProfile.user, role: 'mentor' });
    }
  }

  res.status(200).json({
    success: true,
    data: mentorProfile
  });
});

// @desc    Delete mentor application (Admin)
// @route   DELETE /api/mentors/admin/applications/:id
// @access  Private/Admin
exports.deleteMentor = asyncHandler(async (req, res) => {
  const mentorProfile = await MentorProfile.findById(req.params.id);

  if (!mentorProfile) {
    res.status(404);
    throw new Error('Mentor application not found');
  }

  // If approved, remove 'mentor' role from user
  if (mentorProfile.status === 'approved') {
      await UserRole.findOneAndDelete({ userId: mentorProfile.user, role: 'mentor' });
  }

  await MentorProfile.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current user's mentor profile
// @route   GET /api/mentors/me
// @access  Private
exports.getMine = asyncHandler(async (req, res) => {
  const mentorProfile = await MentorProfile.findOne({ user: req.user.id });

  if (!mentorProfile) {
    return res.status(200).json({
      success: true,
      data: null // Not a mentor yet
    });
  }

  res.status(200).json({
    success: true,
    data: mentorProfile
  });
});
