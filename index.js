require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection, sequelize, seedRoles, Role, Room } = require('./models');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');

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
app.use('/api', monitoringRoutes); // Public - tanpa auth

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 CLASSINFY API - Sistem Manajemen Peminjaman Fasilitas Kampus',
    version: '2.0.0-sprint5',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/profile'],
      rooms: ['GET /api/rooms', 'GET /api/rooms/:id', 'POST /api/rooms'],
      schedules: ['GET /api/schedules/:roomId', 'POST /api/schedules', 'PATCH /api/schedules/:id/status', 'GET /api/schedules/:id/logs'],
      bookings: ['POST /api/bookings/check-conflict', 'POST /api/bookings', 'GET /api/bookings/me', 'GET /api/bookings', 'PATCH /api/bookings/:id/status', 'PATCH /api/bookings/:id/negotiate'],
      monitoring: ['GET /api/monitoring?date=YYYY-MM-DD'],
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

    // 4. Sprint 5: Migrasi kolom & tabel baru (raw SQL agar aman untuk data existing)
    try {
      // Booking: activityWeight
      await sequelize.query(
        'ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "activityWeight" INTEGER DEFAULT 1'
      );
      // Booking: adminNotes
      await sequelize.query(
        'ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT'
      );

      // Booking: tambah value baru ke ENUM status (jika belum ada)
      await sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'needs_negotiation' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_Bookings_status')) THEN
            ALTER TYPE "enum_Bookings_status" ADD VALUE 'needs_negotiation';
          END IF;
        EXCEPTION WHEN others THEN NULL;
        END $$
      `);

      // Schedule: status ENUM + kolom
      await sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_Schedules_status" AS ENUM ('aktif', 'online', 'ditunda', 'batal');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
      `);
      await sequelize.query(
        'ALTER TABLE "Schedules" ADD COLUMN IF NOT EXISTS "status" "enum_Schedules_status" DEFAULT \'aktif\''
      );

      // ScheduleLogs table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "ScheduleLogs" (
          "id" SERIAL PRIMARY KEY,
          "scheduleId" INTEGER NOT NULL REFERENCES "Schedules"("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "userId" UUID NOT NULL,
          "oldStatus" VARCHAR(255) NOT NULL,
          "newStatus" VARCHAR(255) NOT NULL,
          "changedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      console.log('✅ Sprint 5 migration selesai');
    } catch (e) {
      console.error('⚠️ Sprint 5 migration warning:', e.message);
    }

    // 5. Sync semua model yang tersisa
    await sequelize.sync();
    console.log('✅ Database tersinkronisasi');
  } catch (error) {
    console.error('❌ Gagal sinkronisasi database:', error.message);
  }
});