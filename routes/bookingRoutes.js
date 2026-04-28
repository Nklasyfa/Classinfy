const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

// Routes untuk Peminjaman
router.post('/bookings/check-conflict', verifyToken, bookingController.checkConflict);
router.post('/bookings', verifyToken, bookingController.createBooking);
router.get('/bookings/me', verifyToken, bookingController.getMyBookings);
router.get('/bookings', verifyToken, isAdmin, bookingController.getAllBookings);
router.get('/bookings/:id', verifyToken, isAdmin, bookingController.getBookingById);
router.patch('/bookings/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);
router.patch('/bookings/:id/negotiate', verifyToken, isAdmin, bookingController.negotiateBooking);

module.exports = router;
