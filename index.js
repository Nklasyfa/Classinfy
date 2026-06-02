require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection, sequelize, seedRoles, Role, Room } = require('./models');

// Import Routes
const authRoutes = require('./routes/auth/authRoutes');
const roomRoutes = require('./routes/room/roomRoutes');
const scheduleRoutes = require('./routes/schedule/scheduleRoutes');
const bookingRoutes = require('./routes/booking/bookingRoutes');
const monitoringRoutes = require('./routes/monitoring/monitoringRoutes');
const chatRoutes = require('./routes/chat/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routing Endpoint (dengan prefix /api)
app.use('/api/auth', authRoutes);
app.use('/api', roomRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', bookingRoutes);
app.use('/api', monitoringRoutes); // Public - tanpa auth
app.use('/api', require('./routes/user/userRoutes'));
app.use('/api', require('./routes/akademik/akademikRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 CLASSINFY API - Sistem Manajemen Peminjaman Fasilitas Kampus',
    version: '2.0.0-sprint4',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/profile'],
      rooms: ['GET /api/rooms', 'GET /api/rooms/:id', 'POST /api/rooms'],
      schedules: ['GET /api/schedules/:roomId', 'POST /api/schedules', 'PATCH /api/schedules/:id/status'],
      bookings: [
        'POST /api/bookings/check-conflict',
        'POST /api/bookings',
        'GET /api/bookings/me',
        'GET /api/bookings',
        'PATCH /api/bookings/:id/status',
        'PATCH /api/bookings/:id/negotiate',
        'PATCH /api/bookings/:id/respond-negotiation [mahasiswa]',
        'PATCH /api/bookings/:id/force-override [admin]',
        'GET /api/bookings/:id/logs [admin]',
      ],
      monitoring: ['GET /api/monitoring?date=YYYY-MM-DD'],
    },
  });
});

// Export untuk Vercel Serverless Function
module.exports = app;

// Jalankan Server & Koneksi Database (Hanya jika jalan di lokal / bukan Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  await testConnection();

  // Sinkronisasi model ke database
  try {
    // 1. Sync tabel tanpa FK dependencies dulu
    await Role.sync();
    await Room.sync({ alter: true });

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
      // Tambah kolom isVerified & verifiedAt ke Users jika belum ada
      await sequelize.query(
        'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT TRUE'
      );
      await sequelize.query(
        'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMPTZ'
      );
      // Admin (Role 1) & Mahasiswa (Role 2) default verified, lainnya false untuk existing data (opsional)
      await sequelize.query(
        'UPDATE "Users" SET "isVerified" = TRUE WHERE "roleId" IN (1, 2) AND "isVerified" IS NULL'
      );
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
      await sequelize.query(
        'ALTER TABLE "Schedules" ADD COLUMN IF NOT EXISTS "pjId" UUID REFERENCES "Users"("id") ON UPDATE CASCADE ON DELETE SET NULL'
      );

      // Users table additions
      await sequelize.query(
        'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "prodiId" INTEGER REFERENCES "Prodis"("id") ON UPDATE CASCADE ON DELETE SET NULL'
      );
      await sequelize.query(
        'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "profilePicture" VARCHAR(255)'
      );
      await sequelize.query(
        'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "matkulId" INTEGER REFERENCES "Matkuls"("id") ON UPDATE CASCADE ON DELETE SET NULL'
      );
      
      const { Kelas } = require('./models');
      await Kelas.sync({ alter: true });
      
      await sequelize.query('ALTER TABLE "Users" DROP COLUMN IF EXISTS "kelas" CASCADE');
      await sequelize.query(
        'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "kelasId" INTEGER REFERENCES "Kelas"("id") ON UPDATE CASCADE ON DELETE SET NULL'
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

    // ── Sprint 4 Migrations ──────────────────────────────────────────
    try {
      // Booking: attachmentUrl
      await sequelize.query(
        'ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "attachmentUrl" VARCHAR(255)'
      );
      await sequelize.query(
        'ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "adminAttachmentUrl" VARCHAR(255)'
      );

      // UserMatkuls join table for many-to-many User and Matkul
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "UserMatkuls" (
          "userId" UUID NOT NULL REFERENCES "Users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "matkulId" INTEGER NOT NULL REFERENCES "Matkuls"("id") ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY ("userId", "matkulId")
        )
      `);
      
      // Migrate existing matkulId from Users to UserMatkuls
      await sequelize.query(`
        INSERT INTO "UserMatkuls" ("userId", "matkulId")
        SELECT "id", "matkulId" FROM "Users" WHERE "matkulId" IS NOT NULL
        ON CONFLICT DO NOTHING
      `);

      // Booking: tambah ENUM value 'rescheduled'
      await sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rescheduled' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_Bookings_status')) THEN
            ALTER TYPE "enum_Bookings_status" ADD VALUE 'rescheduled';
          END IF;
        EXCEPTION WHEN others THEN NULL;
        END $$
      `);

      // Booking: forceOverrideReason
      await sequelize.query(
        'ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "forceOverrideReason" TEXT'
      );

      // Booking: isForceOverride flag
      await sequelize.query(
        'ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "isForceOverride" BOOLEAN DEFAULT FALSE'
      );

      // BookingLogs audit table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "BookingLogs" (
          "id" SERIAL PRIMARY KEY,
          "bookingId" UUID NOT NULL REFERENCES "Bookings"("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "actorId" UUID NOT NULL,
          "actorRole" VARCHAR(50),
          "oldStatus" VARCHAR(50) NOT NULL,
          "newStatus" VARCHAR(50) NOT NULL,
          "action" VARCHAR(100) NOT NULL,
          "notes" TEXT,
          "isForceOverride" BOOLEAN DEFAULT FALSE,
          "changedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      console.log('✅ Sprint 4 migration selesai');
    } catch (e) {
      console.error('⚠️ Sprint 4 migration warning:', e.message);
    }

    try {
      // Chat Messages table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Messages" (
          "id" UUID PRIMARY KEY,
          "userId" UUID NOT NULL REFERENCES "Users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "senderId" UUID NOT NULL REFERENCES "Users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "text" TEXT NOT NULL,
          "isRead" BOOLEAN DEFAULT FALSE,
          "createdAt" TIMESTAMPTZ NOT NULL,
          "updatedAt" TIMESTAMPTZ NOT NULL
        )
      `);
      console.log('✅ Chat migration selesai');
    } catch (e) {
      console.error('⚠️ Chat migration warning:', e.message);
    }

    // 5. Sync semua model yang tersisa
    await sequelize.sync();
    console.log('✅ Database tersinkronisasi');
  } catch (error) {
    console.error('❌ Gagal sinkronisasi database:', error.message);
  }
});
}