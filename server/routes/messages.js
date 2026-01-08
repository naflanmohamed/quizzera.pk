const express = require('express');
const {
  sendMessage,
  getMyMessages,
  getSentMessages,
  markAsRead
} = require('../controllers/messageController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(sendMessage)
  .get(getMyMessages);

router.get('/sent', getSentMessages);
router.put('/:id/read', markAsRead);

module.exports = router;
