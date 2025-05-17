import { db } from '../config/database.js';

class SantriModel {
  // Mengambil semua data santri dengan filter gender, status, dan role
  static async getAllSantri(gender = null, status = null, role = null) {
    try {
      const queryBuilder = {
        baseQuery: 'SELECT * FROM santri',
        params: [],
        conditions: [],

        addGenderFilter(gender) {
          if (gender) {
            this.conditions.push('gender = ?');
            this.params.push(gender);
          }
          return this;
        },

        addStatusFilter(status) {
          if (status !== null) {
            this.conditions.push('status = ?');
            this.params.push(status === 'true' || status === true ? 'active' : 'inactive');
          }
          return this;
        },

        addRoleFilter(role) {
          if (role) {
            this.conditions.push('role = ?');
            this.params.push(role);
          }
          return this;
        },

        buildFinalQuery() {
          let finalQuery = this.baseQuery;

          if (this.conditions.length > 0) {
            finalQuery += ' WHERE ' + this.conditions.join(' AND ');
          }

          finalQuery += ' ORDER BY created_at DESC';
          return { query: finalQuery, params: this.params };
        },
      };

      const { query, params } = queryBuilder.addGenderFilter(gender).addStatusFilter(status).addRoleFilter(role).buildFinalQuery();

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Mengambil satu data santri berdasarkan ID
  static async getSantriById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM santri WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Mengambil satu data santri berdasarkan kode
  static async getSantriByCode(code) {
    try {
      const [rows] = await db.query('SELECT * FROM santri WHERE code = ?', [code]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Menambah data santri baru
  static async createSantri(santriData) {
    try {
      const {
        code,
        fullname,
        nickname,
        gender,
        role,
        status,
        email,
        phone,
        incoming_year,
        college_year,
        high_school,
        university,
        faculty,
        major,
        birth_place,
        birth_date,
        full_address,
        village,
        district,
        city,
        province,
      } = santriData;

      const [result] = await db.query(
        `INSERT INTO santri (
          code, fullname, nickname, gender, role, status, email, phone,
          incoming_year, college_year, high_school, university, faculty, major,
          birth_place, birth_date, full_address, village, district, city, province, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          fullname,
          nickname,
          gender,
          role,
          status || 'inactive',
          email,
          phone,
          incoming_year,
          college_year,
          high_school,
          university,
          faculty,
          major,
          birth_place,
          birth_date,
          full_address,
          village,
          district,
          city,
          province,
          new Date(),
          new Date(),
        ]
      );

      return {
        id: result.insertId,
        ...santriData,
      };
    } catch (error) {
      throw error;
    }
  }

  // Mengupdate data santri
  static async updateSantri(id, santriData) {
    try {
      const {
        code,
        fullname,
        nickname,
        gender,
        role,
        status,
        email,
        phone,
        incoming_year,
        college_year,
        high_school,
        university,
        faculty,
        major,
        birth_place,
        birth_date,
        full_address,
        village,
        district,
        city,
        province,
      } = santriData;

      const [result] = await db.query(
        `UPDATE santri SET 
          code = ?, fullname = ?, nickname = ?, gender = ?, role = ?, status = ?, 
          email = ?, phone = ?, incoming_year = ?, college_year = ?, high_school = ?, 
          university = ?, faculty = ?, major = ?, birth_place = ?, birth_date = ?, 
          full_address = ?, village = ?, district = ?, city = ?, province = ?, 
          updated_at = ?
        WHERE id = ?`,
        [
          code,
          fullname,
          nickname,
          gender,
          role,
          status || 'inactive',
          email,
          phone,
          incoming_year,
          college_year,
          high_school,
          university,
          faculty,
          major,
          birth_place,
          birth_date,
          full_address,
          village,
          district,
          city,
          province,
          new Date(),
          id,
        ]
      );

      if (result.affectedRows === 0) {
        throw new Error('Santri tidak ditemukan');
      }

      return {
        id,
        ...santriData,
      };
    } catch (error) {
      throw error;
    }
  }

  // Menghapus data santri
  static async deleteSantri(id) {
    try {
      const [result] = await db.query('DELETE FROM santri WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        throw new Error('Santri tidak ditemukan');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Mencari santri berdasarkan nama
  static async searchSantri(searchTerm) {
    try {
      const [rows] = await db.query('SELECT * FROM santri WHERE fullname LIKE ? OR nickname LIKE ?', [`%${searchTerm}%`, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default SantriModel;
