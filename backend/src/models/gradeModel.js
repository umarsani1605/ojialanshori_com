import { db } from '../config/database.js';
import logger from '../utils/logger.js';

class GradeModel {
  // Mengambil semua data grades dengan filter opsional
  static async getAllGrades(filters = {}) {
    try {
      const queryParams = [];
      let whereClause = '';

      // Build where clause dari filter
      if (filters) {
        const conditions = [];

        if (filters.id_santri) {
          conditions.push('g.id_santri = ?');
          queryParams.push(filters.id_santri);
        }

        if (filters.id_pentashih) {
          conditions.push('g.id_pentashih = ?');
          queryParams.push(filters.id_pentashih);
        }

        if (filters.id_category) {
          conditions.push('g.id_category = ?');
          queryParams.push(filters.id_category);
        }

        if (filters.id_subject) {
          conditions.push('g.id_subject = ?');
          queryParams.push(filters.id_subject);
        }

        if (conditions.length > 0) {
          whereClause = 'WHERE ' + conditions.join(' AND ');
        }
      }

      const sql = `
        SELECT g.*, 
               s.fullname as santri_name,
               p.fullname as pentashih_name,
               c.name as category_name,
               sb.name as subject_name,
               sb.has_hafalan,
               sb.has_setoran
        FROM grade_grades g
        LEFT JOIN santri s ON g.id_santri = s.id
        LEFT JOIN santri p ON g.id_pentashih = p.id
        LEFT JOIN grade_categories c ON g.id_category = c.id
        LEFT JOIN grade_subjects sb ON g.id_subject = sb.id
        ${whereClause}
        ORDER BY g.id_santri, c.id, sb.id
      `;

      logger.info('Model Query: ' + sql);
      logger.info('Model Query Params: ' + queryParams);

      const [rows] = await db.query(sql, queryParams);
      return rows;
    } catch (error) {
      logger.error('Model Error: Failed to get grades:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Mengambil detail grade berdasarkan ID
  static async getGradeById(id) {
    try {
      const sql = `
        SELECT g.*, 
               s.fullname as santri_name,
               p.fullname as pentashih_name,
               c.name as category_name,
               sb.name as subject_name,
               sb.has_hafalan,
               sb.has_setoran
        FROM grade_grades g
        LEFT JOIN santri s ON g.id_santri = s.id
        LEFT JOIN santri p ON g.id_pentashih = p.id
        LEFT JOIN grade_categories c ON g.id_category = c.id
        LEFT JOIN grade_subjects sb ON g.id_subject = sb.id
        WHERE g.id = ?
      `;

      const [rows] = await db.query(sql, [id]);
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      logger.error('Model Error: Failed to get grade by ID:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Menambah grade baru
  static async createGrade(data) {
    try {
      // Cek apakah grade sudah ada untuk santri dan subject tersebut
      const [existingRows] = await db.query('SELECT * FROM grade_grades WHERE id_santri = ? AND id_subject = ?', [data.id_santri, data.id_subject]);

      if (existingRows.length > 0) {
        // Jika sudah ada, update grade yang ada
        const existingId = existingRows[0].id;
        return this.updateGrade(existingId, data);
      }

      // Jika belum ada, buat grade baru
      const sql = `
        INSERT INTO grade_grades (id_santri, id_pentashih, id_category, id_subject, hafalan, setoran)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        data.id_santri,
        data.id_pentashih,
        data.id_category,
        data.id_subject,
        data.hafalan || 'belum',
        data.setoran || 'belum',
      ]);

      const id = result.insertId;
      return this.getGradeById(id);
    } catch (error) {
      logger.error('Model Error: Failed to create grade:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Mengupdate grade
  static async updateGrade(id, data) {
    try {
      const sql = `
        UPDATE grade_grades
        SET id_santri = ?,
            id_pentashih = ?,
            id_category = ?,
            id_subject = ?,
            hafalan = ?,
            setoran = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await db.query(sql, [data.id_santri, data.id_pentashih, data.id_category, data.id_subject, data.hafalan, data.setoran, id]);

      return this.getGradeById(id);
    } catch (error) {
      logger.error('Model Error: Failed to update grade:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Menghapus grade
  static async deleteGrade(id) {
    try {
      await db.query('DELETE FROM grade_grades WHERE id = ?', [id]);
      return true;
    } catch (error) {
      logger.error('Model Error: Failed to delete grade:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }
}

export default GradeModel;
