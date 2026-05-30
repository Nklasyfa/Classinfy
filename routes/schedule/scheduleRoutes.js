const express = require('express');
const router = express.Router();
const scheduleController = require('../../controllers/schedule/scheduleController');
const verifyToken = require('../../middlewares/auth/verifyToken');
const isAdmin = require('../../middlewares/auth/isAdmin');
const isPJ = require('../../middlewares/auth/isPJ');

// Routes untuk Jadwal Tetap
router.get('/schedules/me', verifyToken, scheduleController.getMySchedules);
router.get('/schedules/:roomId', verifyToken, scheduleController.getSchedulesByRoom);
router.post('/schedules', verifyToken, isAdmin, scheduleController.createSchedule);

// Dynamic State Layer (PJ/Admin)
router.patch('/schedules/:id/status', verifyToken, isPJ, scheduleController.updateScheduleStatus);
router.get('/schedules/:id/logs', verifyToken, scheduleController.getScheduleLogs);

module.exports = router;
