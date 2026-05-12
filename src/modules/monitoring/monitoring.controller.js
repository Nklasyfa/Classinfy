const { Room, Schedule, Booking, User } = require('../../models');
const { Op } = require('sequelize');

// ==================== GET MONITORING DATA (Public - tanpa auth) ====================
// Mengembalikan semua ruangan beserta jadwal & booking untuk tanggal tertentu
exports.getMonitoringData = async (req, res) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD

    // Default: hari ini
    const targetDate = date ? new Date(date) : new Date();
    const dayOfWeek = targetDate.getDay(); // 0=Minggu, 1=Senin, ...
    const dateString = targetDate.toISOString().split('T')[0];

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Ambil semua ruangan
    const rooms = await Room.findAll({
      order: [['code', 'ASC']],
    });

    // Ambil semua jadwal tetap untuk hari ini
    const schedules = await Schedule.findAll({
      where: { dayOfWeek },
      order: [['startTime', 'ASC']],
    });

    // Ambil semua booking pada tanggal ini (status: pending, approved)
    const bookings = await Booking.findAll({
      where: {
        bookingDate: dateString,
        status: { [Op.in]: ['pending', 'approved'] },
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] },
      ],
      order: [['startTime', 'ASC']],
    });

    // Slot waktu standar
    const timeSlots = [
      { label: '07.00 - 08.40', start: '07:00', end: '08:40' },
      { label: '08.40 - 10.20', start: '08:40', end: '10:20' },
      { label: '10.20 - 12.00', start: '10:20', end: '12:00' },
      { label: '12.00 - 13.40', start: '12:00', end: '13:40' },
      { label: '13.40 - 15.20', start: '13:40', end: '15:20' },
      { label: '15.20 - 17.00', start: '15:20', end: '17:00' },
      { label: '17.00 - 18.40', start: '17:00', end: '18:40' },
    ];

    // Helper: cek apakah waktu overlap
    const isOverlap = (aStart, aEnd, bStart, bEnd) => {
      return aStart < bEnd && aEnd > bStart;
    };

    // Build monitoring data per ruangan
    const monitoringData = rooms.map(room => {
      const roomSchedules = schedules.filter(s => s.roomId === room.id);
      const roomBookings = bookings.filter(b => b.roomId === room.id);

      const slots = timeSlots.map(slot => {
        // Cek jadwal tetap yang overlap dengan slot ini
        const matchedSchedule = roomSchedules.find(s =>
          isOverlap(s.startTime, s.endTime, slot.start, slot.end)
        );

        // Cek booking yang overlap dengan slot ini
        const matchedBooking = roomBookings.find(b =>
          isOverlap(b.startTime, b.endTime, slot.start, slot.end)
        );

        // Prioritas: booking approved > booking pending > jadwal tetap > kosong
        if (matchedBooking && matchedBooking.status === 'approved') {
          return {
            status: 'dipakai',
            title: matchedBooking.purpose,
            person: matchedBooking.user?.username || '-',
            bookingId: matchedBooking.id,
          };
        }

        if (matchedBooking && matchedBooking.status === 'pending') {
          return {
            status: 'pending',
            title: matchedBooking.purpose,
            person: matchedBooking.user?.username || '-',
            bookingId: matchedBooking.id,
          };
        }

        if (matchedSchedule) {
          // Map schedule dynamic status ke monitoring status
          const scheduleStatusMap = {
            aktif: 'terjadwal',   // Jadwal aktif = tampil sebagai terjadwal
            online: 'online',     // Kelas dipindah online
            ditunda: 'ditunda',   // Kelas ditunda
            batal: 'dibatalkan',  // Kelas dibatalkan
          };

          return {
            status: scheduleStatusMap[matchedSchedule.status] || 'terjadwal',
            title: matchedSchedule.activity,
            person: matchedSchedule.semester || '-',
            scheduleId: matchedSchedule.id,
          };
        }

        // Ruangan maintenance
        if (room.status === 'maintenance') {
          return {
            status: 'maintenance',
            title: 'Maintenance',
            person: '-',
          };
        }

        return { status: 'kosong' };
      });

      return {
        id: room.id,
        code: room.code,
        name: room.name,
        capacity: room.capacity,
        location: room.location,
        roomStatus: room.status,
        slots,
      };
    });

    res.status(200).json({
      message: `Data monitoring ruangan untuk ${dayNames[dayOfWeek]}, ${dateString}`,
      date: dateString,
      dayOfWeek,
      dayName: dayNames[dayOfWeek],
      timeSlots: timeSlots.map(s => s.label),
      total: monitoringData.length,
      data: monitoringData,
    });
  } catch (error) {
    console.error('Error getMonitoringData:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
