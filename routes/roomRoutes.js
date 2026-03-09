const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Routes untuk Ruangan/Fasilitas
router.get('/rooms', roomController.getAllRooms);

module.exports = router;
