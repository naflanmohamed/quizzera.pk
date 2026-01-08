const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getMentorBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

const { protect } = require('../middleware/auth');

// All booking routes are protected
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/mentor-bookings', getMentorBookings);
router.put('/:id', updateBookingStatus);

module.exports = router;
