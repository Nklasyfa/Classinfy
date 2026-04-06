require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection, sequelize, seedRoles, Role, Room } = require('./models');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing Endpoint (dengan prefix /api)
app.use('/api/auth', authRoutes);
app.use('/api', roomRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', bookingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 CLASSIFY API - Sistem Manajemen Peminjaman Fasilitas Kampus',
    version: '1.0.0',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/profile'],
      rooms: ['GET /api/rooms', 'GET /api/rooms/:id', 'POST /api/rooms'],
      schedules: ['GET /api/schedules/:roomId', 'POST /api/schedules'],
      bookings: ['POST /api/bookings', 'GET /api/bookings/me', 'GET /api/bookings', 'PATCH /api/bookings/:id/status'],
    },
  });
});

// Jalankan Server & Koneksi Database
app.listen(PORT, async () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  await testConnection();

  // Sinkronisasi model ke database
  try {
    // 1. Sync tabel tanpa FK dependencies dulu
    await Role.sync();
    await Room.sync();

    // 2. Seed roles agar ada data sebelum FK constraint
    await seedRoles();

    // 3. Tambah kolom roleId ke Users jika belum ada (raw SQL migration)
    try {
      await sequelize.query(
        'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "roleId" INTEGER DEFAULT 2'
      );
      await sequelize.query(
        'UPDATE "Users" SET "roleId" = 2 WHERE "roleId" IS NULL'
      );
      await sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Users_roleId_fkey'
          ) THEN
            ALTER TABLE "Users"
              ADD CONSTRAINT "Users_roleId_fkey"
              FOREIGN KEY ("roleId") REFERENCES "Roles"("id")
              ON UPDATE CASCADE ON DELETE SET NULL;
          END IF;
        END $$
      `);
    } catch (e) {
      // Sudah ada, skip
    }

    // 4. Sync semua model yang tersisa
    await sequelize.sync();
    console.log('✅ Database tersinkronisasi');
  } catch (error) {
    console.error('❌ Gagal sinkronisasi database:', error.message);
  }
});