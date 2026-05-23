const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/room/roomController');
const verifyToken = require('../../middlewares/auth/verifyToken');
const isAdmin = require('../../middlewares/auth/isAdmin');

// Routes untuk Ruangan
router.get('/rooms', roomController.getAllRooms);
router.get('/rooms/:id', roomController.getRoomById);
router.post('/rooms', verifyToken, isAdmin, roomController.createRoom);
router.put('/rooms/:id', verifyToken, isAdmin, roomController.updateRoom);
router.delete('/rooms/:id', verifyToken, isAdmin, roomController.deleteRoom);

module.exports = router;
