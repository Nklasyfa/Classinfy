const { Op } = require('sequelize');
const { Booking, Room, User, Schedule } = require('../models');

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

async function detectConflict({ roomId, bookingDate, startTime, endTime, excludeBookingId = null }) {
  const conflicts = [];

  // 1. Cek konflik dengan Booking lain (status: pending / approved)
  const bookingWhere = {
    roomId,
    bookingDate,
    status: { [Op.in]: ['pending', 'approved'] },
    [Op.and]: [
      { startTime: { [Op.lt]: endTime } },   // existing.start < new.end
      { endTime: { [Op.gt]: startTime } },     // existing.end > new.start
    ],
  };

  // Exclude booking tertentu (berguna saat edit/update)
  if (excludeBookingId) {
    bookingWhere.id = { [Op.ne]: excludeBookingId };
  }

  const bookingConflicts = await Booking.findAll({
    where: bookingWhere,
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
    ],
  });

  for (const bc of bookingConflicts) {
    conflicts.push({
      type: 'booking',
      source: 'Permohonan peminjaman lain',
      detail: {
        id: bc.id,
        bookingDate: bc.bookingDate,
        startTime: bc.startTime,
        endTime: bc.endTime,
        purpose: bc.purpose,
        status: bc.status,
        bookedBy: bc.user,
      },
    });
  }

  // 2. Cek konflik dengan Schedule tetap (jadwal akademik rutin)
  const requestDate = new Date(bookingDate);
  const dayOfWeek = requestDate.getDay(); // 0 = Minggu, 1 = Senin, ...

  const scheduleConflicts = await Schedule.findAll({
    where: {
      roomId,
      dayOfWeek,
      [Op.and]: [
        { startTime: { [Op.lt]: endTime } },
        { endTime: { [Op.gt]: startTime } },
      ],
    },
  });

  for (const sc of scheduleConflicts) {
    conflicts.push({
      type: 'schedule',
      source: 'Jadwal akademik tetap',
      detail: {
        id: sc.id,
        day: DAY_NAMES[sc.dayOfWeek],
        startTime: sc.startTime,
        endTime: sc.endTime,
        activity: sc.activity,
        semester: sc.semester,
      },
    });
  }

  return {
    status: conflicts.length === 0 ? 'aman' : 'conflict',
    totalConflicts: conflicts.length,
    conflicts,
  };
}

// ==================== CHECK CONFLICT (Standalone - cek tanpa buat booking) ====================
exports.checkConflict = async (req, res) => {
  try {
    const { roomId, bookingDate, startTime, endTime } = req.body;

    // Validasi input
    if (!roomId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        message: 'roomId, bookingDate, startTime, dan endTime harus diisi',
      });
    }

    // Validasi waktu
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'startTime harus lebih awal dari endTime' });
    }

    // Cek apakah ruangan ada
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    // Cek status ruangan
    if (room.status === 'maintenance') {
      return res.status(200).json({
        status: 'conflict',
        message: 'Ruangan sedang dalam maintenance',
        room: { id: room.id, code: room.code, name: room.name, status: room.status },
        totalConflicts: 1,
        conflicts: [{
          type: 'room_status',
          source: 'Status ruangan',
          detail: { status: 'maintenance', message: 'Ruangan tidak tersedia untuk peminjaman' },
        }],
      });
    }

    // Jalankan deteksi konflik
    const result = await detectConflict({ roomId, bookingDate, startTime, endTime });

    res.status(200).json({
      ...result,
      message: result.status === 'aman'
        ? '✅ AMAN — Tidak ada konflik, ruangan tersedia pada waktu yang diminta.'
        : `⚠️ CONFLICT — Ditemukan ${result.totalConflicts} konflik pada waktu yang diminta.`,
      room: { id: room.id, code: room.code, name: room.name },
      requestedSlot: { bookingDate, startTime, endTime },
    });
  } catch (error) {
    console.error('Error checkConflict:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== CREATE BOOKING (dengan Deteksi Konflik) ====================
exports.createBooking = async (req, res) => {
  try {
    const { roomId, bookingDate, startTime, endTime, purpose } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!roomId || !bookingDate || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        message: 'roomId, bookingDate, startTime, endTime, dan purpose harus diisi',
      });
    }

    // Validasi waktu
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'startTime harus lebih awal dari endTime' });
    }

    // Cek apakah ruangan ada dan available
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }
    if (room.status === 'maintenance') {
      return res.status(400).json({ message: 'Ruangan sedang dalam maintenance, tidak bisa dipinjam' });
    }

    // =====================================================================
    // DETEKSI KONFLIK WAKTU (menggunakan helper reusable)
    // =====================================================================
    const conflictResult = await detectConflict({ roomId, bookingDate, startTime, endTime });

    if (conflictResult.status === 'conflict') {
      return res.status(409).json({
        message: `⚠️ KONFLIK! Ditemukan ${conflictResult.totalConflicts} bentrokan jadwal.`,
        ...conflictResult,
      });
    }

    // =====================================================================
    // Tidak ada konflik → Buat booking baru
    // =====================================================================
    const newBooking = await Booking.create({
      roomId,
      userId,
      bookingDate,
      startTime,
      endTime,
      purpose,
      status: 'pending',
    });

    // Ambil booking beserta relasi
    const bookingDetail = await Booking.findByPk(newBooking.id, {
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
    });

    res.status(201).json({
      message: 'Permohonan peminjaman berhasil disubmit (status: pending)',
      data: bookingDetail,
    });
  } catch (error) {
    console.error('Error createBooking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== GET MY BOOKINGS ====================
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name', 'location'] },
      ],
      order: [['bookingDate', 'DESC'], ['startTime', 'ASC']],
    });

    res.status(200).json({
      message: 'Daftar peminjaman Anda',
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Error getMyBookings:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== GET ALL BOOKINGS (Admin Only) ====================
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Semua data peminjaman',
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Error getAllBookings:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== UPDATE BOOKING STATUS (Admin: Approve/Reject) ====================
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status || !['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        message: 'Status harus salah satu dari: approved, rejected, cancelled',
      });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: `Booking sudah berstatus "${booking.status}", tidak bisa diubah lagi`,
      });
    }

    booking.status = status;
    if (status === 'rejected' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }
    await booking.save();

    const updated = await Booking.findByPk(id, {
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
    });

    res.status(200).json({
      message: `Booking berhasil di-${status}`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updateBookingStatus:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
