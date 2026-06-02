const { Op } = require('sequelize');
const { Booking, Room, User, Schedule } = require('../../models');

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ==================== CONFLICT DETECTION ENGINE ====================
async function detectConflict({ roomId, bookingDate, startTime, endTime, excludeBookingId = null }) {
  const conflicts = [];

  // 1. Cek konflik dengan Booking lain (status: pending / approved / needs_negotiation)
  const bookingWhere = {
    roomId,
    bookingDate,
    status: { [Op.in]: ['pending', 'approved', 'needs_negotiation'] },
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
        activityWeight: bc.activityWeight,
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
      status: { [Op.ne]: 'batal' },
      [Op.and]: [
        { startTime: { [Op.lt]: endTime } },
        { endTime: { [Op.gt]: startTime } },
      ],
    },
  });

  for (const sc of scheduleConflicts) {
    let isAutoCancelled = false;
    if (sc.status === 'ditunda') {
      const today = new Date();
      const wibDateOptions = { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' };
      const todayStr = today.toLocaleDateString('en-CA', wibDateOptions);
      if (bookingDate === todayStr) {
        const wibTimeOptions = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const currentTime = today.toLocaleTimeString('en-GB', wibTimeOptions);
        const [cHour, cMin] = currentTime.split(':').map(Number);
        const currentMins = cHour * 60 + cMin;
        
        const [sHour, sMin] = sc.startTime.split(':').map(Number);
        const startMins = sHour * 60 + sMin;
        if (currentMins >= startMins - 15) {
          isAutoCancelled = true;
        }
      }
    }

    if (!isAutoCancelled) {
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
          status: sc.status,
        },
      });
    }
  }

  return {
    status: conflicts.length === 0 ? 'aman' : 'conflict',
    totalConflicts: conflicts.length,
    conflicts,
  };
}

// ==================== PREEMPTION ENGINE ====================
// Auto-cancel booking yang weight-nya lebih rendah saat ada approval weight lebih tinggi
async function executePreemption({ roomId, bookingDate, startTime, endTime, approvedWeight, excludeBookingId }) {
  const preempted = [];

  // Cari booking bertabrakan yang weight-nya lebih rendah
  const lowerPriorityBookings = await Booking.findAll({
    where: {
      roomId,
      bookingDate,
      status: { [Op.in]: ['pending', 'approved'] },
      activityWeight: { [Op.lt]: approvedWeight },
      id: { [Op.ne]: excludeBookingId },
      [Op.and]: [
        { startTime: { [Op.lt]: endTime } },
        { endTime: { [Op.gt]: startTime } },
      ],
    },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
    ],
  });

  for (const booking of lowerPriorityBookings) {
    const oldStatus = booking.status;
    booking.status = 'cancelled';
    booking.rejectionReason = `Ditimpa oleh kegiatan prioritas lebih tinggi (weight: ${approvedWeight} > ${booking.activityWeight})`;
    await booking.save();

    preempted.push({
      id: booking.id,
      purpose: booking.purpose,
      oldStatus,
      activityWeight: booking.activityWeight,
      bookedBy: booking.user,
    });
  }

  return preempted;
}

// ==================== CHECK CONFLICT (Standalone) ====================
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
    const { roomId, bookingDate, startTime, endTime, purpose, activityWeight } = req.body;
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

    // Validasi activityWeight
    const weight = activityWeight ? parseInt(activityWeight) : 1;
    if (weight < 1 || weight > 5) {
      return res.status(400).json({ message: 'activityWeight harus antara 1-5' });
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
      activityWeight: weight,
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

// ==================== GET BOOKING BY ID (Admin Only) ====================
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name', 'location'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Detail peminjaman',
      data: booking,
    });
  } catch (error) {
    console.error('Error getBookingById:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== UPDATE BOOKING STATUS (Admin: Approve/Reject/Cancel) ====================
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const validStatuses = ['approved', 'rejected', 'cancelled', 'needs_negotiation'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Status harus salah satu dari: approved, rejected, cancelled, needs_negotiation',
      });
    }

    const booking = await Booking.findByPk(id, {
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    // Validasi transisi status yang valid
    const allowedTransitions = {
      pending: ['approved', 'rejected', 'needs_negotiation'],
      needs_negotiation: ['approved', 'rejected', 'cancelled'],
      approved: ['cancelled'],
    };

    const allowed = allowedTransitions[booking.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Tidak bisa mengubah status dari "${booking.status}" ke "${status}"`,
      });
    }

    // =====================================================================
    // PREEMPTION: Saat approve, auto-cancel booking berprioritas lebih rendah
    // =====================================================================
    let preemptedBookings = [];
    if (status === 'approved') {
      preemptedBookings = await executePreemption({
        roomId: booking.roomId,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        approvedWeight: booking.activityWeight,
        excludeBookingId: booking.id,
      });
    }

    booking.status = status;
    if (status === 'rejected' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }
    await booking.save();

    // Reload with fresh data
    await booking.reload({
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
    });

    const response = {
      message: `Booking berhasil di-${status}`,
      data: booking,
    };

    // Sertakan info preemption jika ada
    if (preemptedBookings.length > 0) {
      response.preempted = {
        message: `${preemptedBookings.length} booking berprioritas lebih rendah otomatis dibatalkan`,
        bookings: preemptedBookings,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updateBookingStatus:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== NEGOTIATE BOOKING (Admin: Kirim Rekomendasi) ====================
exports.negotiateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!adminNotes || adminNotes.trim().length === 0) {
      return res.status(400).json({
        message: 'adminNotes (rekomendasi) harus diisi',
      });
    }

    const booking = await Booking.findByPk(id, {
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    // Hanya booking pending yang bisa dinegosiasi
    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: `Booking berstatus "${booking.status}", hanya booking "pending" yang bisa dinegosiasi`,
      });
    }

    booking.status = 'needs_negotiation';
    booking.adminNotes = adminNotes;
    await booking.save();

    await booking.reload({
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
    });

    res.status(200).json({
      message: 'Booking berhasil dipindah ke status negosiasi, rekomendasi admin telah disimpan',
      data: booking,
    });
  } catch (error) {
    console.error('Error negotiateBooking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
