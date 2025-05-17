import { db } from '../config/database.js';

class CategoryModel {
  // Mengambil semua data kategori
  static async getAllCategory() {
    try {
      const [rows] = await db.query('SELECT * FROM categories');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Mengambil satu data kategori berdasarkan ID
  static async getCategoryById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Menambah data kategori baru
  static async createCategory(categoryData) {
    try {
      const { name } = categoryData;
      const [result] = await db.query('INSERT INTO categories (name, created_at, updated_at) VALUES (?, ?, ?)', [name, new Date(), new Date()]);
      return {
        id: result.insertId,
        name,
      };
    } catch (error) {
      throw error;
    }
  }

  // Mengupdate data kategori
  static async updateCategory(id, categoryData) {
    try {
      const { name } = categoryData;
      const [result] = await db.query('UPDATE categories SET name = ?, updated_at = ? WHERE id = ?', [name, new Date(), id]);

      if (result.affectedRows === 0) {
        throw new Error('Kategori tidak ditemukan');
      }

      return {
        id,
        name,
      };
    } catch (error) {
      throw error;
    }
  }

  // Menghapus data kategori
  static async deleteCategory(id) {
    try {
      const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        throw new Error('Kategori tidak ditemukan');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default CategoryModel;
