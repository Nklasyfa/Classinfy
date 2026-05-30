const { Op } = require('sequelize');
const { Schedule, Room, ScheduleLog, User } = require('../../models');

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ==================== GET MY SCHEDULES ====================
exports.getMySchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    let schedules = [];

    if (user.roleId == 4) {
      // PJ: Jadwal tanggung jawab
      const { Matkul, Kelas } = require('../../models');
      let conditions = [];

      if (user.matkulId) {
        const matkul = await Matkul.findByPk(user.matkulId);
        if (matkul) conditions.push({ activity: { [Op.iLike]: `%${matkul.name}%` } });
      }

      if (user.kelasId) {
        const kelas = await Kelas.findByPk(user.kelasId);
        if (kelas) conditions.push({ activity: { [Op.iLike]: `%${kelas.name}%` } });
      }

      if (conditions.length > 0) {
        schedules = await Schedule.findAll({
          where: { [Op.and]: conditions },
          include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name'] }],
          order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
        });
      } else {
        schedules = await Schedule.findAll({
          where: { pjId: userId },
          include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name'] }],
          order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
        });
      }
    } else if (user.roleId == 2 || user.roleId == 3) {
      // Mahasiswa (2) & Dosen (3): Tampilkan semua jadwal di Prodinya agar tidak kosong
      if (user.prodiId) {
        const { Matkul } = require('../../models');
        const matkuls = await Matkul.findAll({ where: { prodiId: user.prodiId } });
        
        if (matkuls.length > 0) {
          const matkulConditions = matkuls.map(m => ({ activity: { [Op.iLike]: `%${m.name}%` } }));
          
          schedules = await Schedule.findAll({
            where: { [Op.or]: matkulConditions },
            include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name'] }],
            order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
          });
        }
      }
    }

    const schedulesWithDay = schedules.map(s => ({
      ...s.toJSON(),
      dayName: DAY_NAMES[s.dayOfWeek],
    }));

    res.status(200).json({
      message: user.roleId == 2 ? `Jadwal Kelas Saya` : `Jadwal tanggung jawab saya`,
      data: schedulesWithDay,
    });
  } catch (error) {
    console.error('Error getMySchedules:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== GET SCHEDULES BY ROOM ====================
exports.getSchedulesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Cek apakah ruangan ada
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    const schedules = await Schedule.findAll({
      where: { roomId },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
    });

    // Tambahkan nama hari ke setiap schedule
    const schedulesWithDay = schedules.map(s => ({
      ...s.toJSON(),
      dayName: DAY_NAMES[s.dayOfWeek],
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

// ==================== UPDATE SCHEDULE STATUS (PJ/Admin: Online/Ditunda/Batal) ====================
exports.updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['aktif', 'online', 'ditunda', 'batal'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Status harus salah satu dari: aktif, online, ditunda, batal',
      });
    }

    const schedule = await Schedule.findByPk(id, {
      include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name'] }],
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    // Validasi Waktu: Hanya bisa diupdate pada hari H & minimal 15 menit sebelum mulai
    const now = new Date();
    const currentDay = now.getDay();

    if (schedule.dayOfWeek !== currentDay) {
      return res.status(403).json({
        message: 'Gagal! Konfirmasi status hanya bisa dilakukan pada hari-H kelas berlangsung.'
      });
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    if (currentTimeInMinutes < startTimeInMinutes - 15) {
      const allowedHour = String(Math.floor((startTimeInMinutes - 15) / 60)).padStart(2, '0');
      const allowedMinute = String((startTimeInMinutes - 15) % 60).padStart(2, '0');
      return res.status(403).json({
        message: `Terlalu cepat! Anda baru bisa mengubah status kelas minimal 15 menit sebelum mulai (Pukul ${allowedHour}:${allowedMinute} WIB).`
      });
    }

    const oldStatus = schedule.status;

    // Jangan update jika status sama
    if (oldStatus === status) {
      return res.status(400).json({
        message: `Status jadwal sudah "${status}", tidak ada perubahan`,
      });
    }

    // Update status
    schedule.status = status;
    await schedule.save();

    // Catat ke history log
    await ScheduleLog.create({
      scheduleId: schedule.id,
      userId,
      oldStatus,
      newStatus: status,
      changedAt: new Date(),
    });

    // Reload dengan relasi
    await schedule.reload({
      include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name'] }],
    });

    res.status(200).json({
      message: `Status jadwal berhasil diubah dari "${oldStatus}" ke "${status}"`,
      data: {
        ...schedule.toJSON(),
        dayName: DAY_NAMES[schedule.dayOfWeek],
      },
    });
  } catch (error) {
    console.error('Error updateScheduleStatus:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== GET SCHEDULE LOGS (Riwayat Perubahan) ====================
exports.getScheduleLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByPk(id, {
      include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name'] }],
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    const logs = await ScheduleLog.findAll({
      where: { scheduleId: id },
      include: [
        { model: User, as: 'changedBy', attributes: ['id', 'username', 'email'] },
      ],
      order: [['changedAt', 'DESC']],
    });

    res.status(200).json({
      message: `Riwayat perubahan status untuk jadwal #${id}`,
      schedule: {
        ...schedule.toJSON(),
        dayName: DAY_NAMES[schedule.dayOfWeek],
      },
      total: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error getScheduleLogs:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
