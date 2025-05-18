import { db } from '../config/database.js';

class GradeCategoryModel {
  // Get all categories
  static async getAllCategory() {
    try {
      const [rows] = await db.query('SELECT * FROM grade_categories ORDER BY name');
      return rows.map((item, index) => ({
        index: index + 1,
        ...item
      }));
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Get category by ID
  static async getCategoryById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM grade_categories WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Create new category
  static async createCategory(data) {
    try {
      const [result] = await db.query(
        'INSERT INTO grade_categories (name, type, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [data.name, data.type || null]
      );
      const newCategoryId = result.insertId;
      return this.getCategoryById(newCategoryId);
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Update category
  static async updateCategory(id, data) {
    try {
      await db.query(
        'UPDATE grade_categories SET name = ?, type = ?, updated_at = NOW() WHERE id = ?',
        [data.name, data.type || null, id]
      );
      return this.getCategoryById(id);
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }

  // Delete category
  static async deleteCategory(id) {
    try {
      await db.query('DELETE FROM grade_categories WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error('Model Error: ' + error.message);
    }
  }
}

export default GradeCategoryModel;
