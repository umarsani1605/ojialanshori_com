import { db } from '../config/database.js';
import logger from '../utils/logger.js';

class PentashihModel {
  // Mengambil semua data pentashih beserta data santri yang dibimbing
  static async getAllPentashih() {
    try {
      const [rows] = await db.query(`
        SELECT DISTINCT p.id_pentashih, s.name as pentashih_name, s.gender as pentashih_gender
        FROM pentashih p
        JOIN santri s ON p.id_pentashih = s.id
      `);

      for (let pentashih of rows) {
        const [santriList] = await db.query(
          `
          SELECT s.* 
          FROM santri s
          JOIN pentashih p ON s.id = p.id_santri 
          WHERE p.id_pentashih = ?
        `,
          [pentashih.id_pentashih]
        );

        pentashih.santri_list = santriList;
      }

      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Mengambil satu data pentashih berdasarkan ID
  static async getPentashihById(id) {
    try {
      const [rows] = await db.query(
        `
        SELECT DISTINCT p.id_pentashih, s.name as pentashih_name 
        FROM pentashih p
        JOIN santri s ON p.id_pentashih = s.id
        WHERE p.id_pentashih = ?
      `,
        [id]
      );

      if (rows[0]) {
        const [santriList] = await db.query(
          `
          SELECT s.* 
          FROM santri s
          JOIN pentashih p ON s.id = p.id_santri
          WHERE p.id_pentashih = ?
        `,
          [id]
        );

        rows[0].santri_list = santriList;
      }

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Menambah data pentashih baru
  static async createPentashih(pentashihData) {
    try {
      const { id_pentashih, santri_ids } = pentashihData;

      let result;

      // Insert ke tabel pentashih untuk setiap santri
      if (santri_ids && santri_ids.length > 0) {
        // Cek duplikasi id_santri
        const [existingData] = await db.query('SELECT id_santri FROM pentashih WHERE id_santri IN (?)', [santri_ids]);

        const existingSantriIds = existingData.map((row) => row.id_santri);
        const uniqueSantriIds = santri_ids.filter((id) => !existingSantriIds.includes(id));

        if (uniqueSantriIds.length > 0) {
          const values = uniqueSantriIds.map((id_santri) => [id_pentashih, id_santri]);
          [result] = await db.query('INSERT INTO pentashih (id_pentashih, id_santri) VALUES ?', [values]);
        } else {
          throw new Error('Semua santri yang dipilih sudah memiliki pentashih');
        }
      }

      return {
        id: result.insertId,
        id_pentashih,
        santri_ids,
      };
    } catch (error) {
      throw error;
    }
  }

  // Mengupdate data pentashih
  static async updatePentashih(id_pentashih, santri_ids) {
    try {
      logger.info('id_pentashih: ' + id_pentashih);
      logger.info('santri_ids: ' + santri_ids);

      if (!id_pentashih) {
        throw new Error('ID Pentashih harus diisi');
      }

      if (!santri_ids || santri_ids.length === 0) {
        throw new Error('Daftar Santri harus diisi');
      }

      await db.query('DELETE FROM pentashih WHERE id_pentashih = ?', [id_pentashih]);

      if (santri_ids && santri_ids.length > 0) {
        const values = santri_ids.map((id_santri) => [id_pentashih, id_santri, new Date(), new Date()]);
        const [result] = await db.query('INSERT INTO pentashih (id_pentashih, id_santri, updated_at, created_at) VALUES ?', [values]);

        return {
          id: result.insertId,
          id_pentashih,
          santri_ids,
        };
      }

      return {
        id_pentashih,
        santri_ids,
      };
    } catch (error) {
      throw error;
    }
  }

  // Menghapus data pentashih
  static async deletePentashih(id) {
    try {
      // Kemudian hapus dari tabel pentashih
      const [result] = await db.query('DELETE FROM pentashih WHERE id_pentashih = ?', [id]);

      if (result.affectedRows === 0) {
        throw new Error('Pentashih tidak ditemukan');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Mengambil daftar santri yang dibimbing oleh pentashih tertentu
  static async getSantriByPentashihId(id_pentashih) {
    try {
      const [rows] = await db.query(
        `
        SELECT s.* 
        FROM santri s
        JOIN pentashih ps ON s.id = ps.id_santri
        WHERE ps.id_pentashih = ?
      `,
        [id_pentashih]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default PentashihModel;
