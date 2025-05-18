import jwt from 'jsonwebtoken';
import SantriModel from '../models/santriModel.js';

// Secret key untuk JWT (sebaiknya gunakan .env untuk production)
const JWT_SECRET = 'your_secret_key_here';

class AuthController {
  // Login handler
  static async login(req, res) {
    try {
      const { emailOrPhone, password } = req.body;

      if (!emailOrPhone || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email/phone dan password harus diisi',
        });
      }

      // Cari santri berdasarkan email atau phone
      const [rows] = await SantriModel.db.query('SELECT * FROM santri WHERE email = ? OR phone = ?', [emailOrPhone, emailOrPhone]);

      const user = rows[0];

      // Jika user tidak ditemukan
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User tidak ditemukan',
        });
      }

      // Cek password (tanpa hashing, hanya string kasar)
      if (user.password !== password) {
        return res.status(401).json({
          status: 'error',
          message: 'Password salah',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Hapus password dari response
      delete user.password;

      // Return token dan data user
      res.json({
        token,
        user: {
          id: user.id,
          code: user.code,
          fullname: user.fullname,
          role: user.role,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
    }
  }

  // Get user session handler
  static async getSession(req, res) {
    // User sudah ada di req karena sudah diproses di middleware
    const { user } = req;

    res.json({ user });
  }
}

export default AuthController;
