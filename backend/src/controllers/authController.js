const { Santri, Pentashih, Admin } = require('../models');

const login = async (req, res) => {
  try {
    const { code } = req.body;

    // Cari santri berdasarkan kode
    const santri = await Santri.findOne({ where: { code } });
    if (!santri) {
      return res.status(404).json({ message: 'Kode tidak valid' });
    }

    // Tentukan role berdasarkan data santri
    let role = 'santri';
    let userData = {
      id: santri.id,
      name: santri.name,
      role: role,
    };

    // Cek apakah santri adalah pentashih
    const pentashih = await Pentashih.findOne({ where: { santri_id: santri.id } });
    if (pentashih) {
      role = 'pentashih';
      userData = {
        ...userData,
        role: role,
        pentashih_id: pentashih.id,
      };
    }

    // Cek apakah santri adalah admin
    const admin = await Admin.findOne({ where: { santri_id: santri.id } });
    if (admin) {
      role = 'admin';
      userData = {
        ...userData,
        role: role,
        admin_id: admin.id,
      };
    }

    // Simpan data user di session
    req.session.user = userData;

    res.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
};

const logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout berhasil' });
};

const getCurrentUser = (req, res) => {
  const user = req.session?.user;
  if (!user) {
    return res.status(401).json({ message: 'Tidak ada user yang login' });
  }
  res.json({ user });
};

module.exports = {
  login,
  logout,
  getCurrentUser,
};
