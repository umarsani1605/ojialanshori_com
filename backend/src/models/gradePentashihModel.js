import { db } from '../config/database.js';
import logger from '../utils/logger.js';

class GradePentashihModel {
  // Get all pentashih
  static async getAllPentashih() {
    try {
      const [rows] = await db.query(`
        SELECT p.*, s.fullname as pentashih_name, s.gender
        FROM grade_pentashih p
        JOIN santri s ON p.id_pentashih = s.id
        ORDER BY s.fullname
      `);

      // Kelompokkan pentashih dan santri yang dibimbing
      const pentashihMap = new Map();

      for (const row of rows) {
        const pentashihId = row.id;

        if (!pentashihMap.has(pentashihId)) {
          // Simpan data dasar pentashih
          pentashihMap.set(pentashihId, {
            index: pentashihMap.size + 1,
            id: pentashihId,
            id_pentashih: row.id_pentashih,
            name: row.pentashih_name,
            gender: row.gender,
            santri_list: [],
          });
        }

        // Tambahkan santri jika ada
        if (row.id_santri) {
          // Dapatkan informasi santri
          const [santriData] = await db.query(`SELECT id, fullname as name, gender, college_year FROM santri WHERE id = ?`, [row.id_santri]);

          if (santriData.length > 0) {
            pentashihMap.get(pentashihId).santri_list.push({
              index: pentashihMap.get(pentashihId).santri_list.length + 1,
              ...santriData[0]
            });
          }
        }
      }

      return Array.from(pentashihMap.values());
    } catch (error) {
      logger.error('Model Error: Failed to get all pentashih:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Get pentashih by ID
  static async getPentashihById(id) {
    try {
      const [rows] = await db.query(
        `
        SELECT p.*, s.fullname as pentashih_name, s.gender 
        FROM grade_pentashih p
        JOIN santri s ON p.id_pentashih = s.id
        WHERE p.id = ?
      `,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const pentashih = {
        id: rows[0].id,
        id_pentashih: rows[0].id_pentashih,
        name: rows[0].pentashih_name,
        gender: rows[0].gender,
        santri_list: [],
      };

      // Dapatkan semua santri yang dibimbing
      const [santriList] = await db.query(
        `SELECT s.id, s.fullname as name, s.gender, s.college_year
         FROM santri s
         JOIN grade_pentashih gp ON s.id = gp.id_santri
         WHERE gp.id_pentashih = ?`,
        [rows[0].id_pentashih]
      );

      pentashih.santri_list = santriList;

      return pentashih;
    } catch (error) {
      logger.error('Model Error: Failed to get pentashih by ID:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Create new pentashih
  static async createPentashih(data) {
    try {
      const { id_pentashih, santri_ids } = data;

      // Begin transaction
      await db.query('START TRANSACTION');

      // Insert pentashih untuk setiap santri yang dibimbing
      if (santri_ids && santri_ids.length > 0) {
        for (const santri_id of santri_ids) {
          await db.query(
            'INSERT INTO grade_pentashih (id_pentashih, id_santri, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [id_pentashih, santri_id]
          );
        }
      } else {
        // Jika tidak ada santri, tetap buat record pentashih
        await db.query(
          'INSERT INTO grade_pentashih (id_pentashih, created_at, updated_at) VALUES (?, NOW(), NOW())',
          [id_pentashih]
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      // Ambil data tentang pentashih yang baru dibuat
      const [result] = await db.query('SELECT id FROM grade_pentashih WHERE id_pentashih = ? LIMIT 1', [id_pentashih]);

      if (result.length === 0) {
        throw new Error('Failed to create pentashih');
      }

      return this.getPentashihById(result[0].id);
    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK');
      logger.error('Model Error: Failed to create pentashih:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Update pentashih
  static async updatePentashih(id, santri_ids) {
    try {
      // Get pentashih ID
      const [pentashihResult] = await db.query('SELECT id_pentashih FROM grade_pentashih WHERE id = ?', [id]);

      if (pentashihResult.length === 0) {
        throw new Error('Pentashih not found');
      }

      const id_pentashih = pentashihResult[0].id_pentashih;

      // Begin transaction
      await db.query('START TRANSACTION');

      // Delete existing santri associations
      await db.query('DELETE FROM grade_pentashih WHERE id_pentashih = ?', [id_pentashih]);

      // Insert new santri associations if available
      if (santri_ids && santri_ids.length > 0) {
        for (const santri_id of santri_ids) {
          await db.query(
            'INSERT INTO grade_pentashih (id_pentashih, id_santri, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [id_pentashih, santri_id]
          );
        }
      } else {
        // Jika tidak ada santri, tetap buat record pentashih
        await db.query(
          'INSERT INTO grade_pentashih (id_pentashih, created_at, updated_at) VALUES (?, NOW(), NOW())',
          [id_pentashih]
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      return this.getPentashihById(id);
    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK');
      logger.error('Model Error: Failed to update pentashih:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Delete pentashih
  static async deletePentashih(id) {
    try {
      // Get pentashih ID
      const [pentashihResult] = await db.query('SELECT id_pentashih FROM grade_pentashih WHERE id = ?', [id]);

      if (pentashihResult.length === 0) {
        throw new Error('Pentashih not found');
      }

      const id_pentashih = pentashihResult[0].id_pentashih;

      // Begin transaction
      await db.query('START TRANSACTION');

      // Delete semua entri pentashih dengan id_pentashih yang sama
      await db.query('DELETE FROM grade_pentashih WHERE id_pentashih = ?', [id_pentashih]);

      // Commit transaction
      await db.query('COMMIT');

      return true;
    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK');
      logger.error('Model Error: Failed to delete pentashih:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Get santri by pentashih ID
  static async getSantriByPentashihId(id) {
    try {
      const [rows] = await db.query(
        `
        SELECT s.id, s.fullname as name, s.gender, s.college_year
        FROM santri s
        JOIN grade_pentashih gp ON s.id = gp.id_santri
        WHERE gp.id_pentashih = ?
        ORDER BY s.fullname
      `,
        [id]
      );
      return rows.map((item, index) => ({
        index: index + 1,
        ...item
      }));
    } catch (error) {
      logger.error('Model Error: Failed to get santri by pentashih ID:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }
}

export default GradePentashihModel;
