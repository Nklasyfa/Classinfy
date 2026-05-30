const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/booking/bookingController');
const verifyToken = require('../../middlewares/auth/verifyToken');
const isAdmin = require('../../middlewares/auth/isAdmin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../public/uploads/');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

// ── Public/User Routes ──────────────────────────────────────────────
router.post('/bookings/check-conflict', verifyToken, bookingController.checkConflict);
router.post('/bookings', verifyToken, upload.single('attachment'), bookingController.createBooking);
router.get('/bookings/me', verifyToken, bookingController.getMyBookings);

// Sprint 4: Mahasiswa respond negosiasi (accept/reject)
router.patch('/bookings/:id/respond-negotiation', verifyToken, bookingController.respondNegotiation);

// ── Admin-only Routes ────────────────────────────────────────────────
router.get('/bookings', verifyToken, isAdmin, bookingController.getAllBookings);
router.get('/bookings/:id', verifyToken, isAdmin, bookingController.getBookingById);
router.patch('/bookings/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);
router.patch('/bookings/:id/negotiate', verifyToken, isAdmin, bookingController.negotiateBooking);

// Sprint 4: Force Override — hak prerogatif admin (bypass conflict)
router.patch('/bookings/:id/force-override', verifyToken, isAdmin, bookingController.forceOverride);

// Sprint 4: Audit Log per booking
router.get('/bookings/:id/logs', verifyToken, isAdmin, bookingController.getBookingLogs);

module.exports = router;
