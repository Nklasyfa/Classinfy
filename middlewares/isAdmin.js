const isAdmin = (req, res, next) => {
  // Middleware ini harus dipanggil SETELAH verifyToken
  if (!req.user) {
    return res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
  }

  if (req.user.roleId !== 1) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya Admin yang bisa mengakses.' });
  }

  next();
};

module.exports = isAdmin;
