import SantriModel from '../models/santriModel.js';
import logger from '../utils/logger.js';

class SantriController {
  // Get all santri dengan filter gender, status, dan role
  static async getAllSantri(req, res) {
    try {
      const { gender, status, role } = req.query;

      logger.info(`Mengambil data santri dengan filter - gender: ${gender || 'semua'}, status: ${status || 'semua'}, role: ${role || 'semua'}`);

      const santri = await SantriModel.getAllSantri(gender, status, role);

      logger.info(`Berhasil mengambil ${santri.length} data santri`);

      res.status(200).json({
        status: 'success',
        data: santri.map((item, index) => ({
          index: index + 1,
          ...item,
        })),
      });
    } catch (error) {
      logger.error('Controller Error: Gagal mengambil data santri:', error);
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Get single santri by ID
  static async getSantriById(req, res) {
    try {
      const { id } = req.params;

      const santri = await SantriModel.getSantriById(id);

      if (!santri) {
        return res.status(404).json({
          status: 'error',
          message: 'Santri tidak ditemukan',
        });
      }

      res.status(200).json({
        status: 'success',
        data: santri,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  // Create new santri
  static async createSantri(req, res) {
    try {
      // Validasi input dasar
      const { fullname, nickname, gender, role } = req.body;

      if (!fullname || !gender || !role) {
        return res.status(400).json({
          status: 'error',
          message: 'Nama lengkap, gender, dan role harus diisi',
        });
      }

      // Validasi gender (gunakan format male/female)
      if (gender !== 'male' && gender !== 'female') {
        return res.status(400).json({
          status: 'error',
          message: 'Jenis kelamin harus male atau female',
        });
      }

      // Buat kode santri jika tidak ada
      let { code } = req.body;
      if (!code) {
        // Generate kode santri: diambil dari huruf pertama nama + tahun masuk + increment
        const initial = fullname.charAt(0).toUpperCase();
        const year = new Date().getFullYear().toString().substring(2);

        // Cari santri dengan pola kode yang sama untuk menentukan urutan
        const existingSantri = await SantriModel.getAllSantri();
        const similarCodes = existingSantri
          .filter((s) => s.code && s.code.startsWith(initial + year))
          .map((s) => s.code)
          .sort();

        let increment = 1;
        if (similarCodes.length > 0) {
          // Ambil nomor terakhir dari kode terbesar + 1
          const lastCode = similarCodes[similarCodes.length - 1];
          const lastNum = parseInt(lastCode.substring(3), 10) || 0;
          increment = lastNum + 1;
        }

        // Format: [Initial][YY][XX] - contoh: A2301, B2302
        code = `${initial}${year}${increment.toString().padStart(2, '0')}`;
      }

      const newSantri = await SantriModel.createSantri({
        code,
        fullname,
        nickname: nickname || fullname.split(' ')[0], // Gunakan nama pertama jika nickname kosong
        gender,
        role,
        status: req.body.status || 'active',
        email: req.body.email || null,
        phone: req.body.phone || null,
        incoming_year: req.body.incoming_year || new Date().getFullYear().toString(),
        college_year: req.body.college_year || null,
        high_school: req.body.high_school || null,
        university: req.body.university || null,
        faculty: req.body.faculty || null,
        major: req.body.major || null,
        birth_place: req.body.birth_place || null,
        birth_date: req.body.birth_date || null,
        full_address: req.body.full_address || null,
        village: req.body.village || null,
        district: req.body.district || null,
        city: req.body.city || null,
        province: req.body.province || null,
      });

      res.status(201).json({
        status: 'success',
        message: 'Data santri berhasil ditambahkan',
        data: newSantri,
      });
    } catch (error) {
      logger.error('Error saat menambah santri:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  // Update santri
  static async updateSantri(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validasi input dasar
      if (updates.fullname === '' || updates.gender === '' || updates.role === '') {
        return res.status(400).json({
          status: 'error',
          message: 'Nama lengkap, gender, dan role tidak boleh kosong',
        });
      }

      // Validasi gender jika diubah
      if (updates.gender && updates.gender !== 'male' && updates.gender !== 'female') {
        return res.status(400).json({
          status: 'error',
          message: 'Jenis kelamin harus male atau female',
        });
      }

      // Cek apakah santri ada
      const existingSantri = await SantriModel.getSantriById(id);
      if (!existingSantri) {
        return res.status(404).json({
          status: 'error',
          message: 'Santri tidak ditemukan',
        });
      }

      // Gabungkan data yang ada dengan update
      const updatedData = {
        ...existingSantri,
        ...updates,
        // Gunakan status yang ada atau yang baru
        status: updates.status || existingSantri.status,
      };

      const updatedSantri = await SantriModel.updateSantri(id, updatedData);

      res.status(200).json({
        status: 'success',
        message: 'Data santri berhasil diperbarui',
        data: updatedSantri,
      });
    } catch (error) {
      logger.error('Error saat update santri:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  // Delete santri
  static async deleteSantri(req, res) {
    try {
      const { id } = req.params;

      // Cek apakah santri ada
      const existingSantri = await SantriModel.getSantriById(id);
      if (!existingSantri) {
        return res.status(404).json({
          status: 'error',
          message: 'Santri tidak ditemukan',
        });
      }

      await SantriModel.deleteSantri(id);

      res.status(200).json({
        status: 'success',
        message: 'Data santri berhasil dihapus',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  // Search santri by name
  static async searchSantri(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.trim() === '') {
        return res.status(400).json({
          status: 'error',
          message: 'Parameter pencarian diperlukan',
        });
      }

      const results = await SantriModel.searchSantri(query);

      res.status(200).json({
        status: 'success',
        data: results,
      });
    } catch (error) {
      logger.error('Error saat mencari santri:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}

export default SantriController;
