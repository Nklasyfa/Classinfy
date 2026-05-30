const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chat/chatController');
const verifyToken = require('../../middlewares/auth/verifyToken');

router.get('/chat', verifyToken, chatController.getMessages);
router.post('/chat', verifyToken, chatController.sendMessage);

module.exports = router;
