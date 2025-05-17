import { db } from '../config/database.js';
import logger from '../utils/logger.js';

class GradeModel {
  // Mengambil semua data grades dengan filter opsional
  static async getAllGrades(filters = {}) {
    try {
      const queryBuilder = {
        baseQuery: `
                    SELECT g.*, 
                           s.name as santri_name,
                           p.id as id_pentashih,
                           p.name as pentashih_name,
                           c.name as category_name,
                           sb.name as subject_name
                    FROM grades g
                    LEFT JOIN santri s ON g.id_santri = s.id
                    LEFT JOIN santri p ON g.id_pentashih = p.id
                    LEFT JOIN categories c ON g.id_category = c.id
                    LEFT JOIN subjects sb ON g.id_subject = sb.id
                `,
        params: [],
        conditions: [],

        addSantriFilter(id_santri) {
          if (id_santri) {
            this.conditions.push('g.id_santri = ?');
            this.params.push(id_santri);
          }
          return this;
        },

        addPentashihFilter(id_pentashih) {
          if (id_pentashih) {
            this.conditions.push('g.id_pentashih = ?');
            this.params.push(id_pentashih);
          }
          return this;
        },

        addCategoryFilter(id_category) {
          if (id_category) {
            this.conditions.push('g.id_category = ?');
            this.params.push(id_category);
          }
          return this;
        },

        addSubjectFilter(id_subject) {
          if (id_subject) {
            this.conditions.push('g.id_subject = ?');
            this.params.push(id_subject);
          }
          return this;
        },

        buildFinalQuery() {
          let finalQuery = this.baseQuery;

          if (this.conditions.length > 0) {
            finalQuery += ' WHERE ' + this.conditions.join(' AND ');
          }

          finalQuery += ' ORDER BY g.created_at DESC';
          return { query: finalQuery, params: this.params };
        },
      };

      const { id_santri, id_pentashih, id_category, id_subject } = filters;
      const { query, params } = queryBuilder
        .addSantriFilter(id_santri)
        .addPentashihFilter(id_pentashih)
        .addCategoryFilter(id_category)
        .addSubjectFilter(id_subject)
        .buildFinalQuery();

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error in getAllGrades:', error);
      throw error;
    }
  }

  // Mengambil detail grade berdasarkan ID
  static async getGradeById(id) {
    try {
      const [rows] = await db.query(
        `SELECT g.*, 
                        s.name as santri_name,
                        p.id as id_pentashih,
                        p.name as pentashih_name,
                        c.name as category_name,
                        sb.name as subject_name
                 FROM grades g
                 LEFT JOIN santri s ON g.id_santri = s.id
                 LEFT JOIN santri p ON g.id_pentashih = p.id
                 LEFT JOIN categories c ON g.id_category = c.id
                 LEFT JOIN subjects sb ON g.id_subject = sb.id
                 WHERE g.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error in getGradeById:', error);
      throw error;
    }
  }

  // Menambah grade baru
  static async createGrade(gradeData) {
    try {
      const { id_santri, id_pentashih, id_category, id_subject, hafalan, setoran } = gradeData;

      const [result] = await db.query(
        `INSERT INTO grades 
                (id_santri, id_pentashih, id_category, id_subject, hafalan, setoran, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id_santri, id_pentashih, id_category, id_subject, hafalan, setoran]
      );

      return {
        id: result.insertId,
        ...gradeData,
      };
    } catch (error) {
      logger.error('Error in createGrade:', error);
      throw error;
    }
  }

  // Mengupdate grade
  static async updateGrade(id, gradeData) {
    try {
      const { id_santri, id_pentashih, id_category, id_subject, hafalan, setoran } = gradeData;

      const [result] = await db.query(
        `UPDATE grades 
                SET id_santri = ?, 
                    id_pentashih = ?,
                    id_category = ?,
                    id_subject = ?,
                    hafalan = ?,
                    setoran = ?,
                    updated_at = NOW()
                WHERE id = ?`,
        [id_santri, id_pentashih, id_category, id_subject, hafalan, setoran, id]
      );

      if (result.affectedRows === 0) {
        throw new Error('Grade tidak ditemukan');
      }

      return {
        id,
        ...gradeData,
      };
    } catch (error) {
      logger.error('Error in updateGrade:', error);
      throw error;
    }
  }

  // Menghapus grade
  static async deleteGrade(id) {
    try {
      const [result] = await db.query('DELETE FROM grades WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        throw new Error('Grade tidak ditemukan');
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteGrade:', error);
      throw error;
    }
  }
}

export default GradeModel;
