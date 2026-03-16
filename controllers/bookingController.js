const { Op } = require('sequelize');
const { Booking, Room, User, Schedule } = require('../models');

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
    // LOGIKA BISNIS KRUSIAL: Deteksi Konflik Waktu
    // =====================================================================

    // 1. Cek konflik dengan Booking lain (status: pending / approved)
    const bookingConflict = await Booking.findOne({
      where: {
        roomId,
        bookingDate,
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },   // booking.start < new.end
          { endTime: { [Op.gt]: startTime } },     // booking.end > new.start
        ],
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
    });

    if (bookingConflict) {
      return res.status(409).json({
        message: '⚠️ KONFLIK! Ruangan sudah dibooking pada waktu tersebut.',
        conflict: {
          type: 'booking',
          existingBooking: {
            id: bookingConflict.id,
            bookingDate: bookingConflict.bookingDate,
            startTime: bookingConflict.startTime,
            endTime: bookingConflict.endTime,
            purpose: bookingConflict.purpose,
            status: bookingConflict.status,
            bookedBy: bookingConflict.user,
          },
        },
      });
    }

    // 2. Cek konflik dengan Schedule tetap (jadwal rutin)
    const requestDate = new Date(bookingDate);
    const dayOfWeek = requestDate.getDay(); // 0 = Minggu, 1 = Senin, ...

    const scheduleConflict = await Schedule.findOne({
      where: {
        roomId,
        dayOfWeek,
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime: { [Op.gt]: startTime } },
        ],
      },
    });

    if (scheduleConflict) {
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return res.status(409).json({
        message: '⚠️ KONFLIK! Bertabrakan dengan jadwal tetap ruangan.',
        conflict: {
          type: 'schedule',
          existingSchedule: {
            id: scheduleConflict.id,
            day: dayNames[scheduleConflict.dayOfWeek],
            startTime: scheduleConflict.startTime,
            endTime: scheduleConflict.endTime,
            activity: scheduleConflict.activity,
          },
        },
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
