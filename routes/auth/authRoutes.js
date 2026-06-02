const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const verifyToken = require('../../middlewares/auth/verifyToken');

const upload = require('../../middlewares/uploadMiddleware');

// Routes untuk Autentikasi
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.post('/profile-picture', verifyToken, upload.single('profilePicture'), authController.uploadProfilePicture);

module.exports = router;
