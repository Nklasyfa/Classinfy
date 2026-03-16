const { Schedule, Room } = require('../models');

// ==================== GET SCHEDULES BY ROOM ====================
exports.getSchedulesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Cek apakah ruangan ada
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const schedules = await Schedule.findAll({
      where: { roomId },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
    });

    // Tambahkan nama hari ke setiap schedule
    const schedulesWithDay = schedules.map(s => ({
      ...s.toJSON(),
      dayName: dayNames[s.dayOfWeek],
    }));

    res.status(200).json({
      message: `Jadwal tetap untuk ruangan ${room.name}`,
      total: schedules.length,
      data: schedulesWithDay,
    });
  } catch (error) {
    console.error('Error getSchedulesByRoom:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== CREATE SCHEDULE (Admin Only) ====================
exports.createSchedule = async (req, res) => {
  try {
    const { roomId, dayOfWeek, startTime, endTime, activity, semester } = req.body;

    if (roomId == null || dayOfWeek == null || !startTime || !endTime || !activity) {
      return res.status(400).json({ message: 'roomId, dayOfWeek, startTime, endTime, dan activity harus diisi' });
    }

    // Cek apakah ruangan ada
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    // Validasi waktu
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'startTime harus lebih awal dari endTime' });
    }

    // Cek konflik dengan jadwal tetap lain di ruangan & hari yang sama
    const { Op } = require('sequelize');
    const conflicting = await Schedule.findOne({
      where: {
        roomId,
        dayOfWeek,
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime: { [Op.gt]: startTime } },
        ],
      },
    });

    if (conflicting) {
      return res.status(409).json({
        message: 'Konflik jadwal! Sudah ada jadwal tetap di waktu tersebut.',
        conflict: conflicting,
      });
    }

    const schedule = await Schedule.create({ roomId, dayOfWeek, startTime, endTime, activity, semester });

    res.status(201).json({
      message: 'Jadwal tetap berhasil dibuat',
      data: schedule,
    });
  } catch (error) {
    console.error('Error createSchedule:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
