const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.session?.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
};
