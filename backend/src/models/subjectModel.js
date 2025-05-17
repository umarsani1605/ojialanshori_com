import { db } from '../config/database.js';

class SubjectModel {
  // Mengambil semua data subject
  static async getAllSubject() {
    try {
      const [rows] = await db.query(`
        SELECT s.*, c.name as category_name 
        FROM subjects s
        LEFT JOIN categories c ON s.id_category = c.id
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Mengambil satu data subject berdasarkan ID
  static async getSubjectById(id) {
    try {
      const [rows] = await db.query(
        `
        SELECT s.*, c.name as category_name 
        FROM subjects s
        LEFT JOIN categories c ON s.id_category = c.id
        WHERE s.id = ?
      `,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Menambah data subject baru
  static async createSubject(subjectData) {
    try {
      const { name, id_category, has_hafalan, has_setoran } = subjectData;
      const [result] = await db.query(
        'INSERT INTO subjects (name, id_category, has_hafalan, has_setoran, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [name, id_category, has_hafalan, has_setoran, new Date(), new Date()]
      );
      return {
        id: result.insertId,
        ...subjectData,
      };
    } catch (error) {
      throw error;
    }
  }

  // Mengupdate data subject
  static async updateSubject(id, subjectData) {
    try {
      const { name, id_category, has_hafalan, has_setoran } = subjectData;
      const [result] = await db.query(
        'UPDATE subjects SET name = ?, id_category = ?, has_hafalan = ?, has_setoran = ?, updated_at = ? WHERE id = ?',
        [name, id_category, has_hafalan, has_setoran, new Date(), id]
      );

      if (result.affectedRows === 0) {
        throw new Error('Subject tidak ditemukan');
      }

      return {
        id,
        ...subjectData,
      };
    } catch (error) {
      throw error;
    }
  }

  // Menghapus data subject
  static async deleteSubject(id) {
    try {
      const [result] = await db.query('DELETE FROM subjects WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        throw new Error('Subject tidak ditemukan');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Mengambil subject berdasarkan category
  static async getSubjectByCategory(category_id) {
    try {
      const [rows] = await db.query(
        `SELECT s.* 
        FROM subjects s
        WHERE s.id_category = ?
        ORDER BY s.name ASC`,
        [category_id]
      );

      return rows;
    } catch (error) {
      logger.error('Error in getSubjectByCategory:', error);
      throw error;
    }
  }
}

export default SubjectModel;
