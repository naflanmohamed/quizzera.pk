const Booking = require('../models/Booking');
const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res) => {
  const { mentorId, date, duration, notes, topic } = req.body;

  // Check if mentor exists
  const mentorProfile = await MentorProfile.findById(mentorId);
  if (!mentorProfile || mentorProfile.status !== 'approved') {
      res.status(404);
      throw new Error('Mentor not found or not available');
  }

  if (mentorProfile.user.toString() === req.user.id) {
      res.status(400);
      throw new Error('You cannot book a session with yourself');
  }

  const booking = await Booking.create({
    mentor: mentorProfile.user,
    student: req.user.id,
    date,
    duration,
    notes,
    topic,
    status: 'pending' // Default to pending, mentor needs to confirm? or auto-confirm? Let's say pending.
  });

  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get my bookings (Student)
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ student: req.user.id })
    .populate('mentor', 'name avatar email')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get mentor bookings (Mentor)
// @route   GET /api/bookings/mentor-bookings
// @access  Private
exports.getMentorBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ mentor: req.user.id })
    .populate('student', 'name avatar email')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, meetingLink } = req.body; 

  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ensure user is authorized (Mentor or Admin, or Student for cancelling)
  if (booking.mentor.toString() !== req.user.id && booking.student.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this booking');
  }

  // If student, can only cancel
  if (booking.student.toString() === req.user.id && status !== 'cancelled') {
      res.status(401);
      throw new Error('Students can only cancel bookings');
  }

  booking.status = status || booking.status;
  if (meetingLink) {
      booking.meetingLink = meetingLink;
  }

  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});
