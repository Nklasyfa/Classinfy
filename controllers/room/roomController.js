const { Room, Schedule, Booking } = require('../../models');

// ==================== GET ALL ROOMS ====================
exports.getAllRooms = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null;
    const size = req.query.size ? parseInt(req.query.size) : null;

    if (page && size) {
      const limit = size;
      const offset = (page - 1) * limit;
      const result = await Room.findAndCountAll({
        order: [['code', 'ASC']],
        limit,
        offset,
      });
      return res.status(200).json({
        message: 'Berhasil mengambil daftar ruangan',
        totalItems: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: page,
        data: result.rows,
      });
    } else {
      const rooms = await Room.findAll({
        order: [['code', 'ASC']],
      });
      return res.status(200).json({
        message: 'Berhasil mengambil daftar ruangan',
        totalItems: rooms.length,
        totalPages: 1,
        currentPage: 1,
        data: rooms,
      });
    }
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
    const { code, name, capacity, location, status, facilities } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: 'Code dan name ruangan harus diisi' });
    }

    // Cek duplikat code
    const existing = await Room.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: `Ruangan dengan kode "${code}" sudah ada` });
    }

    const room = await Room.create({ code, name, capacity, location, status, facilities });

    res.status(201).json({
      message: 'Ruangan berhasil dibuat',
      data: room,
    });
  } catch (error) {
    console.error('Error createRoom:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== UPDATE ROOM (Admin Only) ====================
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, capacity, location, status, facilities } = req.body;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    if (code && code !== room.code) {
      const existing = await Room.findOne({ where: { code } });
      if (existing) {
        return res.status(400).json({ message: `Ruangan dengan kode "${code}" sudah ada` });
      }
    }

    await room.update({ code, name, capacity, location, status, facilities });

    res.status(200).json({
      message: 'Ruangan berhasil diupdate',
      data: room,
    });
  } catch (error) {
    console.error('Error updateRoom:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== DELETE ROOM (Admin Only) ====================
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    await room.destroy();

    res.status(200).json({ message: 'Ruangan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteRoom:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
