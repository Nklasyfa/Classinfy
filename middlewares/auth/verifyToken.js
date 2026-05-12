const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  // Format: "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Format token salah.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'secret_key_default_123';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { id, email, roleId }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
};

module.exports = verifyToken;
