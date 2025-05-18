import jwt from 'jsonwebtoken';
import SantriModel from '../models/santriModel.js';

// Secret key untuk JWT (sebaiknya gunakan .env untuk production)
const JWT_SECRET = 'your_secret_key_here';

// Middleware untuk verifikasi JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Ambil header authorization
    const authHeader = req.headers.authorization;

    // Cek apakah header ada dan format Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token tidak ditemukan',
      });
    }

    // Ambil token dari header
    const token = authHeader.split(' ')[1];

    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Ambil data user dari database
    const santri = await SantriModel.getSantriById(decoded.userId);

    // Jika user tidak ditemukan
    if (!santri) {
      return res.status(401).json({
        status: 'error',
        message: 'User tidak valid',
      });
    }

    // Hapus password dari data user
    delete santri.password;

    // Simpan user ke request object
    req.user = santri;

    // Lanjut ke handler berikutnya
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token tidak valid',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token sudah kadaluarsa',
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export default authMiddleware;
