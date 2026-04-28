const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const isPJ = require('../middlewares/isPJ');

// Routes untuk Jadwal Tetap
router.get('/schedules/:roomId', verifyToken, scheduleController.getSchedulesByRoom);
router.post('/schedules', verifyToken, isAdmin, scheduleController.createSchedule);

// Dynamic State Layer (PJ/Admin)
router.patch('/schedules/:id/status', verifyToken, isPJ, scheduleController.updateScheduleStatus);
router.get('/schedules/:id/logs', verifyToken, isPJ, scheduleController.getScheduleLogs);

module.exports = router;
