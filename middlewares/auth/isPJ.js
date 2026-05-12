/**
 * Middleware: isPJ (Penanggung Jawab)
 * Mengizinkan akses untuk Admin (1), Dosen (3), atau PJ (4).
 * Harus dipanggil SETELAH verifyToken.
 */
const isPJ = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
  }

  // roleId 1 = Admin, roleId 3 = Dosen, roleId 4 = PJ
  const allowedRoles = [1, 3, 4];
  if (!allowedRoles.includes(req.user.roleId)) {
    return res.status(403).json({
      message: 'Akses ditolak. Hanya Admin, Dosen, atau PJ yang bisa mengakses.',
    });
  }

  next();
};

module.exports = isPJ;
