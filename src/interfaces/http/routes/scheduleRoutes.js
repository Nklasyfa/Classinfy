const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

// Routes untuk Jadwal Tetap
router.get('/schedules/:roomId', verifyToken, scheduleController.getSchedulesByRoom);
router.post('/schedules', verifyToken, isAdmin, scheduleController.createSchedule);

module.exports = router;
