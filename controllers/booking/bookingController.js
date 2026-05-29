const { Op } = require('sequelize');
const { Booking, Room, User, Schedule, BookingLog } = require('../../models');

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ========== PRIORITY TIER LABELS ==========
const PRIORITY_LABELS = {
  5: 'Tingkat Eksekutif/Rektorat',
  4: 'Kemahasiswaan & BEM Fakultas',
  3: 'Kegiatan Utama Mahasiswa (Seminar/Lomba)',
  2: 'Rapat Rutin UKM/HIMA',
  1: 'Kegiatan Reguler/Diskusi Umum',
};

// ========== HELPERS ==========
async function logBookingAction({ bookingId, actorId, actorRole, oldStatus, newStatus, action, notes = null, isForceOverride = false }) {
  await BookingLog.create({ bookingId, actorId, actorRole, oldStatus, newStatus, action, notes, isForceOverride, changedAt: new Date() });
}

async function detectConflict({ roomId, bookingDate, startTime, endTime, excludeBookingId = null }) {
  const conflicts = [];

  const bookingWhere = {
    roomId, bookingDate,
    status: { [Op.in]: ['pending', 'approved', 'needs_negotiation', 'rescheduled'] },
    [Op.and]: [{ startTime: { [Op.lt]: endTime } }, { endTime: { [Op.gt]: startTime } }],
  };
  if (excludeBookingId) bookingWhere.id = { [Op.ne]: excludeBookingId };

  const bookingConflicts = await Booking.findAll({
    where: bookingWhere,
    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
  });

  for (const bc of bookingConflicts) {
    conflicts.push({
      type: 'booking', source: 'Permohonan peminjaman lain',
      detail: { id: bc.id, bookingDate: bc.bookingDate, startTime: bc.startTime, endTime: bc.endTime, purpose: bc.purpose, status: bc.status, activityWeight: bc.activityWeight, bookedBy: bc.user },
    });
  }

  const [year, month, day] = bookingDate.split('-').map(Number);
  const requestDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = requestDate.getUTCDay();
  const scheduleConflicts = await Schedule.findAll({
    where: { roomId, dayOfWeek, status: 'aktif', [Op.and]: [{ startTime: { [Op.lt]: endTime } }, { endTime: { [Op.gt]: startTime } }] },
  });

  for (const sc of scheduleConflicts) {
    conflicts.push({
      type: 'schedule', source: 'Jadwal akademik tetap',
      detail: { id: sc.id, day: DAY_NAMES[sc.dayOfWeek], startTime: sc.startTime, endTime: sc.endTime, activity: sc.activity, semester: sc.semester, status: sc.status },
    });
  }

  return { status: conflicts.length === 0 ? 'aman' : 'conflict', totalConflicts: conflicts.length, conflicts };
}

async function executePreemption({ roomId, bookingDate, startTime, endTime, approvedWeight, excludeBookingId, actorId, actorRole, isForceOverride = false }) {
  const preempted = [];
  const lowerPriorityBookings = await Booking.findAll({
    where: {
      roomId, bookingDate,
      status: { [Op.in]: ['pending', 'approved', 'rescheduled'] },
      activityWeight: { [Op.lt]: approvedWeight },
      id: { [Op.ne]: excludeBookingId },
      [Op.and]: [{ startTime: { [Op.lt]: endTime } }, { endTime: { [Op.gt]: startTime } }],
    },
    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
  });

  for (const booking of lowerPriorityBookings) {
    const oldStatus = booking.status;
    booking.status = 'cancelled';
    booking.rejectionReason = `Ditimpa kegiatan prioritas lebih tinggi (Tier ${approvedWeight} > Tier ${booking.activityWeight})${isForceOverride ? ' [FORCE OVERRIDE]' : ''}`;
    await booking.save();
    await logBookingAction({ bookingId: booking.id, actorId, actorRole, oldStatus, newStatus: 'cancelled', action: 'preempted', notes: booking.rejectionReason, isForceOverride });
    preempted.push({ id: booking.id, purpose: booking.purpose, oldStatus, activityWeight: booking.activityWeight, bookedBy: booking.user });
  }
  return preempted;
}

const withRelations = [
  { model: Room, as: 'room', attributes: ['id', 'code', 'name', 'location'] },
  { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
];

// ========== CHECK CONFLICT (public standalone) ==========
exports.checkConflict = async (req, res) => {
  try {
    const { roomId, bookingDate, startTime, endTime } = req.body;
    if (!roomId || !bookingDate || !startTime || !endTime)
      return res.status(400).json({ message: 'roomId, bookingDate, startTime, dan endTime harus diisi' });
    if (startTime >= endTime)
      return res.status(400).json({ message: 'startTime harus lebih awal dari endTime' });

    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    if (room.status === 'maintenance') {
      return res.status(200).json({ status: 'conflict', message: 'Ruangan sedang dalam maintenance', room: { id: room.id, code: room.code, name: room.name, status: room.status }, totalConflicts: 1, conflicts: [{ type: 'room_status', source: 'Status ruangan', detail: { status: 'maintenance' } }] });
    }

    const result = await detectConflict({ roomId, bookingDate, startTime, endTime });
    res.status(200).json({
      ...result,
      message: result.status === 'aman' ? '✅ AMAN — Tidak ada konflik, ruangan tersedia.' : `⚠️ CONFLICT — Ditemukan ${result.totalConflicts} konflik.`,
      room: { id: room.id, code: room.code, name: room.name },
      requestedSlot: { bookingDate, startTime, endTime },
    });
  } catch (error) {
    console.error('Error checkConflict:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== CREATE BOOKING (dengan Priority Scoring Auto-Reject) ==========
exports.createBooking = async (req, res) => {
  try {
    const { roomId, bookingDate, startTime, endTime, purpose, activityWeight } = req.body;
    const userId = req.user.id;

    if (!roomId || !bookingDate || !startTime || !endTime || !purpose)
      return res.status(400).json({ message: 'roomId, bookingDate, startTime, endTime, dan purpose harus diisi' });
    if (startTime >= endTime)
      return res.status(400).json({ message: 'startTime harus lebih awal dari endTime' });

    const weight = activityWeight ? parseInt(activityWeight) : 1;
    if (weight < 1 || weight > 5)
      return res.status(400).json({ message: 'activityWeight harus antara 1-5' });

    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    if (room.status === 'maintenance')
      return res.status(400).json({ message: 'Ruangan sedang dalam maintenance' });

    // =====================================================================
    // SPRINT 4 — PRIORITY SCORING ENGINE
    // Jika ada booking yang sudah approved dengan weight LEBIH TINGGI,
    // tolak otomatis (auto-reject) permohonan baru ini.
    // =====================================================================
    const higherPriorityConflict = await Booking.findOne({
      where: {
        roomId, bookingDate,
        status: { [Op.in]: ['approved'] },
        activityWeight: { [Op.gt]: weight },
        [Op.and]: [{ startTime: { [Op.lt]: endTime } }, { endTime: { [Op.gt]: startTime } }],
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
    });

    if (higherPriorityConflict) {
      return res.status(409).json({
        status: 'conflict',
        message: `⛔ AUTO-REJECT: Slot ini sudah dikunci oleh kegiatan Tier ${higherPriorityConflict.activityWeight} (${PRIORITY_LABELS[higherPriorityConflict.activityWeight]}). Permohonan Tier ${weight} Anda tidak dapat diproses.`,
        conflictingBooking: {
          id: higherPriorityConflict.id,
          activityWeight: higherPriorityConflict.activityWeight,
          tierLabel: PRIORITY_LABELS[higherPriorityConflict.activityWeight],
          purpose: higherPriorityConflict.purpose,
          timeSlot: `${higherPriorityConflict.startTime} - ${higherPriorityConflict.endTime}`,
        },
      });
    }

    // Cek konflik umum (dengan pending/needs_negotiation/approved)
    const conflictResult = await detectConflict({ roomId, bookingDate, startTime, endTime });
    if (conflictResult.status === 'conflict') {
      // Periksa apakah ada konflik yang tidak bisa dilompati (akademik, atau booking dengan prioritas >= weight)
      const unbypassableConflicts = conflictResult.conflicts.filter(c => {
        if (c.type === 'schedule') return true; // Akademik tidak bisa di-preempt
        if (c.type === 'booking') {
          const isActive = ['pending', 'approved', 'needs_negotiation', 'rescheduled'].includes(c.detail.status);
          return isActive && c.detail.activityWeight >= weight;
        }
        return false;
      });

      if (unbypassableConflicts.length > 0) {
        return res.status(409).json({
          status: 'conflict',
          message: `⚠️ KONFLIK! Ditemukan bentrokan jadwal dengan prioritas lebih tinggi/setara atau kegiatan akademik tetap.`,
          conflicts: unbypassableConflicts,
        });
      }
    }

    const newBooking = await Booking.create({ roomId, userId, bookingDate, startTime, endTime, purpose, activityWeight: weight, status: 'pending' });

    const bookingDetail = await Booking.findByPk(newBooking.id, { include: withRelations });

    // Log: created
    await logBookingAction({ bookingId: newBooking.id, actorId: userId, actorRole: 'Mahasiswa', oldStatus: '-', newStatus: 'pending', action: 'created', notes: `Permohonan diajukan. Tier ${weight}: ${PRIORITY_LABELS[weight]}` });

    res.status(201).json({ message: 'Permohonan berhasil disubmit (status: pending)', data: bookingDetail });
  } catch (error) {
    console.error('Error createBooking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== GET MY BOOKINGS ==========
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.findAll({
      where: { userId },
      include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name', 'location'] }],
      order: [['bookingDate', 'DESC'], ['startTime', 'ASC']],
    });
    res.status(200).json({ message: 'Daftar peminjaman Anda', total: bookings.length, data: bookings });
  } catch (error) {
    console.error('Error getMyBookings:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== GET ALL BOOKINGS (Admin) ==========
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Room, as: 'room', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ message: 'Semua data peminjaman', total: bookings.length, data: bookings });
  } catch (error) {
    console.error('Error getAllBookings:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== GET BOOKING BY ID ==========
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
      include: [
        ...withRelations,
        { model: BookingLog, as: 'logs', include: [{ model: User, as: 'actor', attributes: ['id', 'username'] }], order: [['changedAt', 'ASC']] },
      ],
    });
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    res.status(200).json({ message: 'Detail peminjaman', data: booking });
  } catch (error) {
    console.error('Error getBookingById:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== UPDATE BOOKING STATUS (Admin: Approve/Reject/Cancel/Needs_Negotiation) ==========
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const actorId = req.user.id;
    const actorRole = req.user.roleId === 1 ? 'Admin' : 'User';

    const validStatuses = ['approved', 'rejected', 'cancelled', 'needs_negotiation'];
    if (!status || !validStatuses.includes(status))
      return res.status(400).json({ message: 'Status harus salah satu dari: approved, rejected, cancelled, needs_negotiation' });

    const booking = await Booking.findByPk(id, { include: withRelations });
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    const allowedTransitions = {
      pending: ['approved', 'rejected', 'needs_negotiation'],
      needs_negotiation: ['approved', 'rejected', 'cancelled'],
      rescheduled: ['approved', 'rejected', 'cancelled'],
      approved: ['cancelled'],
    };

    const allowed = allowedTransitions[booking.status];
    if (!allowed || !allowed.includes(status))
      return res.status(400).json({ message: `Tidak bisa mengubah status dari "${booking.status}" ke "${status}"` });

    let preemptedBookings = [];
    if (status === 'approved') {
      const conflictResult = await detectConflict({
        roomId: booking.roomId, bookingDate: booking.bookingDate,
        startTime: booking.startTime, endTime: booking.endTime,
        excludeBookingId: booking.id
      });

      if (conflictResult.status === 'conflict') {
        const unbypassableConflicts = conflictResult.conflicts.filter(c => {
          if (c.type === 'schedule') return true;
          if (c.type === 'booking') {
            return c.detail.status === 'approved' && c.detail.activityWeight >= booking.activityWeight;
          }
          return false;
        });

        if (unbypassableConflicts.length > 0) {
          return res.status(409).json({
            message: 'Gagal approve! Terdapat konflik dengan jadwal akademik atau peminjaman lain yang sudah disetujui.',
            conflicts: unbypassableConflicts
          });
        }
      }

      preemptedBookings = await executePreemption({
        roomId: booking.roomId, bookingDate: booking.bookingDate,
        startTime: booking.startTime, endTime: booking.endTime,
        approvedWeight: booking.activityWeight, excludeBookingId: booking.id,
        actorId, actorRole,
      });
    }

    const oldStatus = booking.status;
    booking.status = status;
    if ((status === 'rejected' || status === 'cancelled') && rejectionReason) booking.rejectionReason = rejectionReason;
    await booking.save();

    await logBookingAction({ bookingId: booking.id, actorId, actorRole, oldStatus, newStatus: status, action: status, notes: rejectionReason || null });

    await booking.reload({ include: withRelations });
    const response = { message: `Booking berhasil di-${status}`, data: booking };
    if (preemptedBookings.length > 0) {
      response.preempted = { message: `${preemptedBookings.length} booking berprioritas lebih rendah otomatis dibatalkan`, bookings: preemptedBookings };
    }
    res.status(200).json(response);
  } catch (error) {
    console.error('Error updateBookingStatus:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== NEGOTIATE BOOKING (Admin → Mahasiswa) ==========
exports.negotiateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const actorId = req.user.id;

    if (!adminNotes || adminNotes.trim().length === 0)
      return res.status(400).json({ message: 'adminNotes (rekomendasi ruang/waktu alternatif) harus diisi' });

    const booking = await Booking.findByPk(id, { include: withRelations });
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    if (booking.status !== 'pending')
      return res.status(400).json({ message: `Booking berstatus "${booking.status}", hanya booking "pending" yang bisa dinegosiasi` });

    const oldStatus = booking.status;
    booking.status = 'needs_negotiation';
    booking.adminNotes = adminNotes;
    await booking.save();

    await logBookingAction({ bookingId: booking.id, actorId, actorRole: 'Admin', oldStatus, newStatus: 'needs_negotiation', action: 'negotiate', notes: adminNotes });

    await booking.reload({ include: withRelations });
    res.status(200).json({ message: 'Booking dipindah ke negosiasi. Rekomendasi admin telah dikirim ke pemohon.', data: booking });
  } catch (error) {
    console.error('Error negotiateBooking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== RESPOND NEGOTIATION (Mahasiswa: Accept/Reject nego) ==========
// Sprint 4 — State Machine: needs_negotiation → rescheduled | cancelled
exports.respondNegotiation = async (req, res) => {
  try {
    const { id } = req.params;
    const { response: userResponse, userNotes } = req.body; // response: 'accept' | 'reject'
    const actorId = req.user.id;

    if (!['accept', 'reject'].includes(userResponse))
      return res.status(400).json({ message: 'response harus "accept" atau "reject"' });

    const booking = await Booking.findByPk(id, { include: withRelations });
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    // Pastikan hanya pemohon sendiri yang bisa respond
    if (booking.userId !== actorId)
      return res.status(403).json({ message: 'Anda tidak memiliki akses untuk merespons permohonan ini' });

    if (booking.status !== 'needs_negotiation')
      return res.status(400).json({ message: `Booking berstatus "${booking.status}", hanya booking "needs_negotiation" yang bisa direspons` });

    const oldStatus = booking.status;
    let newStatus, action, message;

    if (userResponse === 'accept') {
      // Mahasiswa setuju dengan rekomendasi admin → status: rescheduled (pending re-approval)
      newStatus = 'rescheduled';
      action = 'respond_accept';
      message = 'Negosiasi diterima. Permohonan berubah ke status "Rescheduled" dan menunggu persetujuan akhir admin.';
    } else {
      // Mahasiswa menolak negosiasi → cancelled
      newStatus = 'cancelled';
      action = 'respond_reject';
      message = 'Negosiasi ditolak. Permohonan dibatalkan.';
    }

    booking.status = newStatus;
    if (userNotes) booking.rejectionReason = userNotes;
    await booking.save();

    await logBookingAction({ bookingId: booking.id, actorId, actorRole: 'Mahasiswa', oldStatus, newStatus, action, notes: userNotes || null });

    await booking.reload({ include: withRelations });
    res.status(200).json({ message, data: booking });
  } catch (error) {
    console.error('Error respondNegotiation:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== FORCE OVERRIDE (Admin — Bypass Konflik untuk Darurat) ==========
// Sprint 4 — Hak Prerogatif Admin / Force Majeure
exports.forceOverride = async (req, res) => {
  try {
    const { id } = req.params;
    const { forceOverrideReason } = req.body;
    const actorId = req.user.id;

    if (!forceOverrideReason || forceOverrideReason.trim().length < 10)
      return res.status(400).json({ message: 'forceOverrideReason harus diisi minimal 10 karakter (alasan force majeure)' });

    const booking = await Booking.findByPk(id, { include: withRelations });
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    const validSourceStatuses = ['pending', 'needs_negotiation', 'rescheduled'];
    if (!validSourceStatuses.includes(booking.status))
      return res.status(400).json({ message: `Force Override hanya bisa dilakukan pada booking berstatus: ${validSourceStatuses.join(', ')}` });

    // =========================================================
    // BYPASS: Lewati conflict detection. Langsung approve.
    // Lalu jalankan preemption untuk membatalkan yang konflik.
    // =========================================================
    const preemptedBookings = await executePreemption({
      roomId: booking.roomId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      approvedWeight: 99, // Force override beats everything
      excludeBookingId: booking.id,
      actorId,
      actorRole: 'Admin',
      isForceOverride: true,
    });

    const oldStatus = booking.status;
    booking.status = 'approved';
    booking.forceOverrideReason = forceOverrideReason;
    booking.isForceOverride = true;
    booking.adminNotes = `[FORCE OVERRIDE] ${forceOverrideReason}`;
    await booking.save();

    await logBookingAction({
      bookingId: booking.id,
      actorId,
      actorRole: 'Admin',
      oldStatus,
      newStatus: 'approved',
      action: 'force_override',
      notes: forceOverrideReason,
      isForceOverride: true,
    });

    await booking.reload({ include: withRelations });

    res.status(200).json({
      message: `✅ FORCE OVERRIDE BERHASIL — Permohonan disetujui paksa. ${preemptedBookings.length} booking konflik dibatalkan otomatis.`,
      data: booking,
      preempted: {
        total: preemptedBookings.length,
        bookings: preemptedBookings,
      },
      warning: '⚠️ Aksi ini dicatat dalam audit log sebagai Force Override (force majeure).',
    });
  } catch (error) {
    console.error('Error forceOverride:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ========== GET BOOKING LOGS (Admin) ==========
exports.getBookingLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    const logs = await BookingLog.findAll({
      where: { bookingId: id },
      include: [{ model: User, as: 'actor', attributes: ['id', 'username', 'email'] }],
      order: [['changedAt', 'ASC']],
    });

    res.status(200).json({ message: `Audit log untuk booking ${id}`, total: logs.length, data: logs });
  } catch (error) {
    console.error('Error getBookingLogs:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
