const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

// Routes untuk Ruangan
router.get('/rooms', verifyToken, roomController.getAllRooms);
router.get('/rooms/:id', verifyToken, roomController.getRoomById);
router.post('/rooms', verifyToken, isAdmin, roomController.createRoom);
router.put('/rooms/:id', verifyToken, isAdmin, roomController.updateRoom);
router.delete('/rooms/:id', verifyToken, isAdmin, roomController.deleteRoom);

module.exports = router;
