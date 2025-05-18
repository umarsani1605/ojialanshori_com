import { db } from '../config/database.js';
import logger from '../utils/logger.js';

class GradeSubjectModel {
  // Get all subjects
  static async getAllSubject() {
    try {
      const [rows] = await db.query(`
        SELECT s.*, c.name as category_name 
        FROM grade_subjects s 
        LEFT JOIN grade_categories c ON s.id_category = c.id
        ORDER BY s.name
      `);
      return rows.map((item, index) => ({
        index: index + 1,
        ...item
      }));
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Get subject by ID
  static async getSubjectById(id) {
    try {
      const [rows] = await db.query(
        `
        SELECT s.*, c.name as category_name 
        FROM grade_subjects s 
        LEFT JOIN grade_categories c ON s.id_category = c.id
        WHERE s.id = ?
      `,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Create new subject
  static async createSubject(data) {
    try {
      const { name, id_category, has_hafalan, has_setoran } = data;
      const [result] = await db.query(
        'INSERT INTO grade_subjects (name, id_category, has_hafalan, has_setoran, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [name, id_category, has_hafalan, has_setoran]
      );

      const newSubjectId = result.insertId;
      return this.getSubjectById(newSubjectId);
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Update subject
  static async updateSubject(id, data) {
    try {
      const { name, id_category, has_hafalan, has_setoran } = data;
      await db.query(
        'UPDATE grade_subjects SET name = ?, id_category = ?, has_hafalan = ?, has_setoran = ?, updated_at = NOW() WHERE id = ?',
        [name, id_category, has_hafalan, has_setoran, id]
      );

      return this.getSubjectById(id);
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Delete subject
  static async deleteSubject(id) {
    try {
      await db.query('DELETE FROM grade_subjects WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Get subjects by category
  static async getSubjectByCategory(category_id) {
    try {
      logger.info('Getting subjects for category ID:', category_id);

      const [rows] = await db.query(
        `
        SELECT s.*, c.name as category_name 
        FROM grade_subjects s 
        LEFT JOIN grade_categories c ON s.id_category = c.id
        WHERE s.id_category = ?
        ORDER BY s.name
      `,
        [category_id]
      );

      return rows.map((item, index) => ({
        index: index + 1,
        ...item
      }));
    } catch (error) {
      logger.error('Model Error: Failed to get subjects by category:', error);
      throw new Error('Model Error: ' + error.message);
    }
  }
}

export default GradeSubjectModel;
