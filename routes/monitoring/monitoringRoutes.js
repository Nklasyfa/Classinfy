const express = require('express');
const router = express.Router();
const monitoringController = require('../../controllers/monitoring/monitoringController');

// Public route — tidak perlu login untuk melihat monitoring
router.get('/monitoring', monitoringController.getMonitoringData);

module.exports = router;
