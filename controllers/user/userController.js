const { User, Role } = require('../../models');
const { Op } = require('sequelize');

// ==================== GET ALL USERS ====================
exports.getAllUsers = async (req, res) => {
  try {
    const { Prodi, Matkul, Kelas } = require('../../models');
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name'] },
        { model: Prodi, as: 'prodi', attributes: ['id', 'name'] },
        { model: Matkul, as: 'matkuls', attributes: ['id', 'name'], through: { attributes: [] } },
        { model: Kelas, as: 'kelas', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Berhasil mengambil daftar pengguna',
      total: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error getAllUsers:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== VERIFY USER ====================
exports.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    user.isVerified = isVerified;
    if (isVerified) {
      user.verifiedAt = new Date();
    } else {
      user.verifiedAt = null;
    }
    
    await user.save();

    res.status(200).json({
      message: `User berhasil ${isVerified ? 'diverifikasi' : 'ditangguhkan'}`,
      data: user,
    });
  } catch (error) {
    console.error('Error verifyUser:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== UPDATE USER ROLE ====================
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Cek apakah role valid
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    user.roleId = roleId;
    await user.save();

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });

    res.status(200).json({
      message: 'Role user berhasil diupdate',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updateUserRole:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== CREATE USER ====================
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, roleId, prodiId, matkulId, kelasId, isVerified } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, dan password wajib diisi' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      roleId: roleId || 2,
      prodiId: prodiId || null,
      matkulId: matkulId || null,
      kelasId: kelasId || null,
      isVerified: isVerified !== undefined ? isVerified : true,
      verifiedAt: (isVerified !== false) ? new Date() : null,
    });

    const userWithRole = await User.findByPk(newUser.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json({
      message: 'User berhasil dibuat',
      data: userWithRole,
    });
  } catch (error) {
    console.error('Error createUser:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== DELETE USER ====================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await user.destroy();

    res.status(200).json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteUser:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
