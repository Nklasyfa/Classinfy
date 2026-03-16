const { Room, Schedule, Booking } = require('../models');

// ==================== GET ALL ROOMS ====================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      order: [['code', 'ASC']],
    });

    res.status(200).json({
      message: 'Berhasil mengambil daftar ruangan',
      total: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error('Error getAllRooms:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== GET ROOM BY ID ====================
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id, {
      include: [
        { model: Schedule, as: 'schedules', order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']] },
        {
          model: Booking,
          as: 'bookings',
          where: { status: ['pending', 'approved'] },
          required: false,
          order: [['bookingDate', 'ASC']],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Detail ruangan',
      data: room,
    });
  } catch (error) {
    console.error('Error getRoomById:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== CREATE ROOM (Admin Only) ====================
exports.createRoom = async (req, res) => {
  try {
    const { code, name, capacity, location, status } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: 'Code dan name ruangan harus diisi' });
    }

    // Cek duplikat code
    const existing = await Room.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: `Ruangan dengan kode "${code}" sudah ada` });
    }

    const room = await Room.create({ code, name, capacity, location, status });

    res.status(201).json({
      message: 'Ruangan berhasil dibuat',
      data: room,
    });
  } catch (error) {
    console.error('Error createRoom:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
