const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

// Routes untuk Peminjaman
router.post('/bookings', verifyToken, bookingController.createBooking);
router.get('/bookings/me', verifyToken, bookingController.getMyBookings);
router.get('/bookings', verifyToken, isAdmin, bookingController.getAllBookings);
router.patch('/bookings/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);

module.exports = router;
