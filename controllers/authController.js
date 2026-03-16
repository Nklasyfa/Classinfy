const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { username, email, password, roleId } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Semua field (username, email, password) harus diisi' });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Buat user baru (password di-hash otomatis oleh hook di model)
    const newUser = await User.create({
      username,
      email,
      password,
      roleId: roleId || 2, // Default: Mahasiswa
    });

    // Ambil user beserta role-nya
    const userWithRole = await User.findByPk(newUser.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      data: userWithRole,
    });
  } catch (error) {
    console.error('Error saat register:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    // Cari user beserta role
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate token JWT (sertakan roleId)
    const jwtSecret = process.env.JWT_SECRET || 'secret_key_default_123';
    const token = jwt.sign(
      { id: user.id, email: user.email, roleId: user.roleId },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login berhasil',
      token,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ==================== GET PROFILE ====================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Profil user',
      data: user,
    });
  } catch (error) {
    console.error('Error saat get profile:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
