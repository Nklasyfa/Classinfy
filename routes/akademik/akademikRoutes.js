const express = require('express');
const router = express.Router();
const akademikController = require('../../controllers/akademik/akademikController');

// Middleware autentikasi
const authMiddleware = require('../../middlewares/auth/verifyToken');
const adminMiddleware = require('../../middlewares/auth/isAdmin');

// Public endpoints (for registration)
router.get('/prodis', akademikController.getProdis);
router.get('/matkuls', akademikController.getMatkuls);
router.get('/kelas', akademikController.getKelas);

// Admin endpoints
router.post('/prodis', authMiddleware, adminMiddleware, akademikController.createProdi);
router.put('/prodis/:id', authMiddleware, adminMiddleware, akademikController.updateProdi);
router.delete('/prodis/:id', authMiddleware, adminMiddleware, akademikController.deleteProdi);

router.post('/matkuls', authMiddleware, adminMiddleware, akademikController.createMatkul);
router.put('/matkuls/:id', authMiddleware, adminMiddleware, akademikController.updateMatkul);
router.delete('/matkuls/:id', authMiddleware, adminMiddleware, akademikController.deleteMatkul);

router.post('/kelas', authMiddleware, adminMiddleware, akademikController.createKelas);
router.put('/kelas/:id', authMiddleware, adminMiddleware, akademikController.updateKelas);
router.delete('/kelas/:id', authMiddleware, adminMiddleware, akademikController.deleteKelas);

module.exports = router;
