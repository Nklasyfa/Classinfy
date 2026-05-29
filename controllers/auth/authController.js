const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Matkul, Kelas, Schedule } = require('../../models');
const { Op } = require('sequelize');

// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { username, email, password, roleId, prodiId, matkulId, kelasId } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Semua field (username, email, password) harus diisi' });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      roleId: roleId || 2, // Default: Mahasiswa
      prodiId: prodiId || null,
      matkulId: matkulId || null,
      kelasId: kelasId || null,
      isVerified: (roleId == 2 || !roleId) ? true : false, // Hanya Mahasiswa yang auto-verified
    });

    // Otomatis assign Schedule ke PJ jika matkul dipilih
    if (roleId == 4 && matkulId) {
      const matkul = await Matkul.findByPk(matkulId);
      const kelas = kelasId ? await Kelas.findByPk(kelasId) : null;
      
      if (matkul) {
        let activityLike = `%${matkul.name}%`;
        if (kelas) {
          activityLike = `%${matkul.name}%${kelas.name}%`;
        }

        await Schedule.update(
          { pjId: newUser.id },
          {
            where: {
              activity: {
                [Op.iLike]: activityLike
              }
            }
          }
        );
      }
    }

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
    res.status(500).json({ message: 'Terjadi kesalahan pada server: ' + error.message });
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

    // Cek verifikasi (Admin/Dosen/PJ harus diverifikasi dulu)
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Akun Anda belum diverifikasi oleh Administrator. Silakan hubungi admin untuk aktivasi akun.' 
      });
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
