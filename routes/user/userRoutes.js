const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const verifyToken = require('../../middlewares/auth/verifyToken');
const isAdmin = require('../../middlewares/auth/isAdmin');

// Routes untuk Manajemen User (Admin Only)
router.get('/users', verifyToken, isAdmin, userController.getAllUsers);
router.post('/users', verifyToken, isAdmin, userController.createUser);
router.patch('/users/:id/verify', verifyToken, isAdmin, userController.verifyUser);
router.patch('/users/:id/role', verifyToken, isAdmin, userController.updateUserRole);
router.delete('/users/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
