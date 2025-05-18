import { db } from '../config/database.js';

class StatisticModel {
  // Pendaftar Baru (30 hari terakhir)
  static async getNewRegistrants() {
    try {
      const [result] = await db.query(`
        SELECT COUNT(*) as total 
        FROM santri 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `);
      return result[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Total Santri
  static async getTotalSantri() {
    try {
      const [result] = await db.query(`
        SELECT COUNT(*) as total 
        FROM santri
      `);
      return result[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Total Santri Aktif
  static async getActiveSantri() {
    try {
      const [result] = await db.query(`
        SELECT COUNT(*) as total 
        FROM santri 
        WHERE status = 'active'
      `);
      return result[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Total Santri Tidak Aktif
  static async getInactiveSantri() {
    try {
      const [result] = await db.query(`
        SELECT COUNT(*) as total 
        FROM santri 
        WHERE status = 'inactive'
      `);
      return result[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Distribusi Gender
  static async getGenderDistribution() {
    try {
      const [result] = await db.query(`
        SELECT 
          gender,
          COUNT(*) as total
        FROM santri
        WHERE status = 'active'
        GROUP BY gender
      `);
      
      return {
        male: result.find(r => r.gender === 'male')?.total || 0,
        female: result.find(r => r.gender === 'female')?.total || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Distribusi per Tahun Kuliah
  static async getYearlyDistribution() {
    try {
      const [result] = await db.query(`
        SELECT 
          college_year,
          COUNT(*) as total
        FROM santri
        WHERE 
          status = 'active'
          AND college_year IS NOT NULL
          AND college_year != ''
        GROUP BY college_year
        ORDER BY college_year DESC
      `);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Mengambil semua statistik sekaligus
  static async getDashboardStats() {
    try {
      const [newRegistrants, totalSantri, activeSantri, inactiveSantri, genderDistribution, yearlyDistribution] = await Promise.all([
        this.getNewRegistrants(),
        this.getTotalSantri(),
        this.getActiveSantri(),
        this.getInactiveSantri(),
        this.getGenderDistribution(),
        this.getYearlyDistribution()
      ]);

      return {
        newRegistrants,
        totalSantri,
        activeSantri,
        inactiveSantri,
        genderDistribution,
        yearlyDistribution
      };
    } catch (error) {
      throw error;
    }
  }
}

export default StatisticModel; 