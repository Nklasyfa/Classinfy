require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parsing req.body berbentuk JSON
app.use(express.urlencoded({ extended: true }));

// Routing Endpoint (/api/...)
app.use('/api', authRoutes);
app.use('/api', roomRoutes);

// Jalankan Server & Koneksi Database
app.listen(PORT, async () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    // Panggil helper tes koneksi DB
    await testConnection();
});