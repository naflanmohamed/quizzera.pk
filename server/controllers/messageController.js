const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, subject, content } = req.body;

  const recipient = await User.findById(recipientId);

  if (!recipient) {
    res.status(404);
    throw new Error('Recipient not found');
  }

  const message = await Message.create({
    sender: req.user.id,
    recipient: recipientId,
    subject,
    content
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Get my messages (received)
// @route   GET /api/messages
// @access  Private
exports.getMyMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ recipient: req.user.id })
    .populate('sender', 'name avatar email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Get sent messages
// @route   GET /api/messages/sent
// @access  Private
exports.getSentMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ sender: req.user.id })
    .populate('recipient', 'name avatar email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  let message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Ensure user is the recipient
  if (message.recipient.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this message');
  }

  message.isRead = true;
  message.readAt = Date.now();
  await message.save();

  res.status(200).json({
    success: true,
    data: message
  });
});
