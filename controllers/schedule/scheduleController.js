const { Op } = require('sequelize');
const { Schedule, Room, ScheduleLog, User } = require('../../models');

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ==================== GET MY SCHEDULES ====================
exports.getMySchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    let schedules = [];

    if (user.roleId == 2 || user.roleId == 3 || user.roleId == 4) {
      const { Matkul, Kelas, Prodi } = require('../../models');
      let pjKelasName = null;
      let userMatkuls = [];

      const userWithMatkuls = await User.findByPk(userId, { 
        include: [{ association: 'matkuls', include: ['prodi'] }] 
      });
      if (userWithMatkuls && userWithMatkuls.matkuls) {
        userMatkuls = userWithMatkuls.matkuls;
      }

      // If user still uses old matkulId, fetch it as fallback
      if (userMatkuls.length === 0 && user.matkulId) {
         const oldMatkul = await Matkul.findByPk(user.matkulId, { include: ['prodi'] });
         if (oldMatkul) userMatkuls.push(oldMatkul);
      }

      if (user.kelasId) {
        const kelas = await Kelas.findByPk(user.kelasId);
        if (kelas) pjKelasName = kelas.name;
      }

      if ((user.roleId == 2 || user.roleId == 4) && user.prodiId) {
        // Mahasiswa & PJ melihat semua matkul di prodi
        const prodi = await Prodi.findByPk(user.prodiId);
        const allMatkulsInProdi = await Matkul.findAll({ where: { prodiId: user.prodiId } });
        
        let prodiOr = [];
        if (prodi) {
          allMatkulsInProdi.forEach(m => prodiOr.push({ activity: { [Op.iLike]: `%${prodi.name}%${m.name}%` } }));
        } else {
          allMatkulsInProdi.forEach(m => prodiOr.push({ activity: { [Op.iLike]: `%${m.name}%` } }));
        }
        
        // Fallback: Jika relasi matkul ke prodi kosong di DB, gunakan nama prodi
        if (prodiOr.length === 0 && prodi) {
          prodiOr.push({ activity: { [Op.iLike]: `%${prodi.name}%` } });
        }
        
        if (prodiOr.length > 0) {
          schedules = await Schedule.findAll({
            where: { [Op.or]: prodiOr },
            include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name'] }],
            order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
          });
        }
      } else {
        // Dosen (3) hanya melihat matkul yang diampu secara spesifik (termasuk Prodinya agar tidak bocor)
        let fallbackOr = [];
        if (userMatkuls.length > 0) {
          userMatkuls.forEach(m => {
             const prodiPrefix = m.prodi ? `%${m.prodi.name}%` : '%';
             fallbackOr.push({ activity: { [Op.iLike]: `${prodiPrefix}${m.name}%` } });
          });
        }
        
        // Dosen tidak difilter berdasarkan kelasId. Hanya Mahasiswa/PJ jika ada.
        if (pjKelasName && (user.roleId == 2 || user.roleId == 4)) {
          if (fallbackOr.length > 0) {
            fallbackOr = userMatkuls.map(m => {
               const prodiPrefix = m.prodi ? `%${m.prodi.name}%` : '%';
               return { activity: { [Op.iLike]: `${prodiPrefix}${m.name}%${pjKelasName}%` } };
            });
          } else {
            fallbackOr.push({ activity: { [Op.iLike]: `%${pjKelasName}%` } });
          }
        }

        if (fallbackOr.length > 0) {
          schedules = await Schedule.findAll({
            where: { [Op.or]: fallbackOr },
            include: [{ model: Room, as: 'room', attributes: ['id', 'code', 'name'] }],
            order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
          });
        }
      }

      const schedulesWithDay = schedules.map(s => {
        let canEdit = false;
        if (user.roleId == 3) {
          canEdit = true; // Dosen can edit all their matkuls
        } else if (user.roleId == 4) {
          // PJ can edit only their registered matkuls AND kelas
          let matches = false;
          let matkulMatches = false;
          let kelasMatches = true;
          
          if (userMatkuls.length > 0) {
             matkulMatches = userMatkuls.some(m => (s.activity || '').toLowerCase().includes((m.name || '').toLowerCase()));
          }
          if (pjKelasName) {
             kelasMatches = (s.activity || '').toLowerCase().includes((pjKelasName || '').toLowerCase());
          }
          
          // Harus cocok dua-duanya jika dua-duanya ada
          if (userMatkuls.length > 0 && pjKelasName) {
            matches = matkulMatches && kelasMatches;
          } else if (userMatkuls.length > 0) {
            matches = matkulMatches;
          } else if (pjKelasName) {
            matches = kelasMatches;
          }
          
          if (s.pjId === user.id) matches = true;
          canEdit = matches;
        }

        const sData = s.toJSON();
        
        // Auto-cancel logic for 'ditunda' (unconfirmed schedules)
        if (sData.status === 'ditunda') {
            const now = new Date();
            const wib = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
            const distanceDays = (sData.dayOfWeek - wib.getDay() + 7) % 7;
            
            // Jika hari H dan sudah lewat batas konfirmasi (-15 menit)
            if (distanceDays === 0) {
              const currentMins = wib.getHours() * 60 + wib.getMinutes();
              const [sHour, sMin] = sData.startTime.split(':').map(Number);
              const startMins = sHour * 60 + sMin;
              if (currentMins >= startMins - 15) {
                  sData.status = 'batal';
                  // Jika sudah batal karena telat, seharusnya tidak bisa diedit lagi
                  // (Backend juga akan memblokir ini)
              }
            }
        }

        return {
          ...sData,
          dayName: DAY_NAMES[s.dayOfWeek],
          canEdit
        };
      });

      return res.status(200).json({
        message: user.roleId == 2 ? `Jadwal Kelas Saya` : `Jadwal tanggung jawab saya`,
        data: schedulesWithDay,
      });
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
    console.error("Error in getMySchedules:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message, stack: error.stack });
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

    // Validasi Waktu: minimal 2 hari sebelum matkul dan maximal nya adalah 15 mnit sbelum matkul
    const now = new Date();
    const currentWibTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
    const currentDay = currentWibTime.getDay();

    const distanceDays = (schedule.dayOfWeek - currentDay + 7) % 7;
    
    if (distanceDays > 2) {
      return res.status(403).json({
        message: 'Gagal! Konfirmasi status baru bisa dilakukan mulai 2 hari sebelum jadwal.'
      });
    }

    const currentHour = currentWibTime.getHours();
    const currentMinute = currentWibTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    if (distanceDays === 0 && currentTimeInMinutes >= startTimeInMinutes - 15) {
      return res.status(403).json({
        message: 'Terlambat! Batas waktu konfirmasi status adalah 15 menit sebelum kelas dimulai.'
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
