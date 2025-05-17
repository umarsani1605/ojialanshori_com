import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';
import logger from './logger.js';

// Mendapatkan path direktori dari file saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path ke file CSV (naik dua folder level ke backend root)
const csvFilePath = path.join(__dirname, '../../data_santri.csv');

// Fungsi untuk menambah jeda
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fungsi untuk mengkonversi format tanggal DD-MM-YYYY ke YYYY-MM-DD
function convertDateFormat(dateStr) {
  if (!dateStr) return null;

  // Validasi format D(D)-M(M)-YYYY
  const dateRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  const match = dateStr.match(dateRegex);

  if (!match) {
    logger.warn(`Format tanggal tidak valid: ${dateStr}`);
    return null;
  }

  let [_, day, month, year] = match;

  // Tambahkan leading zero jika perlu
  day = day.padStart(2, '0');
  month = month.padStart(2, '0');

  // Validasi range tanggal dan bulan
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  if (monthNum < 1 || monthNum > 12) {
    logger.warn(`Bulan tidak valid (${monthNum}) untuk tanggal: ${dateStr}`);
    return null;
  }

  // Array jumlah hari dalam setiap bulan (0-based index)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Cek tahun kabisat
  if (yearNum % 4 === 0 && (yearNum % 100 !== 0 || yearNum % 400 === 0)) {
    daysInMonth[1] = 29;
  }

  if (dayNum < 1 || dayNum > daysInMonth[monthNum - 1]) {
    logger.warn(`Tanggal tidak valid (${dayNum}) untuk bulan ${monthNum} tahun ${yearNum}`);
    return null;
  }

  return `${year}-${month}-${day}`;
}

// Fungsi untuk mengimpor data
async function importSantriData() {
  try {
    // Buat tabel santri jika belum ada
    await createTableIfNotExists();

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Baca file CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    logger.info(`CSV dibaca: ${results.length} baris data`);

    // Proses setiap baris data
    for (const santri of results) {
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        // Ubah nilai kosong menjadi null
        Object.keys(santri).forEach((key) => {
          if (santri[key] === '' || santri[key] === '-') {
            santri[key] = null;
          }
        });

        // Simpan status sebagai string "active" atau "inactive"
        const status = santri.status || 'inactive';

        // Siapkan data untuk disimpan ke database
        const data = {
          code: santri.code || null,
          fullname: santri.fullname || santri.nickname,
          nickname: santri.nickname,
          gender: santri.gender,
          role: santri.role || 'santri',
          status: status,
          email: santri.email,
          phone: santri.phone,
          incoming_year: santri.incoming_year,
          college_year: santri.college_year,
          high_school: santri.high_school,
          university: santri.university,
          faculty: santri.faculty,
          major: santri.major,
          birth_place: santri.birth_place,
          birth_date: convertDateFormat(santri.birth_date),
          full_address: santri.full_address,
          village: santri.village,
          district: santri.district,
          city: santri.city,
          province: santri.province,
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Log data yang akan diinsert
        logger.info(
          `Mencoba menyimpan data: ${JSON.stringify({
            code: data.code,
            fullname: data.fullname,
            nickname: data.nickname,
          })}`
        );

        const query = `
          INSERT INTO santri (
            code, fullname, nickname, gender, role, status, email, phone,
            incoming_year, college_year, high_school, university, faculty, major,
            birth_place, birth_date, full_address, village, district, city, province,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            fullname = VALUES(fullname),
            nickname = VALUES(nickname),
            gender = VALUES(gender),
            role = VALUES(role),
            status = VALUES(status),
            email = VALUES(email),
            phone = VALUES(phone),
            incoming_year = VALUES(incoming_year),
            college_year = VALUES(college_year),
            high_school = VALUES(high_school),
            university = VALUES(university),
            faculty = VALUES(faculty),
            major = VALUES(major),
            birth_place = VALUES(birth_place),
            birth_date = VALUES(birth_date),
            full_address = VALUES(full_address),
            village = VALUES(village),
            district = VALUES(district),
            city = VALUES(city),
            province = VALUES(province),
            updated_at = VALUES(updated_at)
        `;

        const values = [
          data.code,
          data.fullname,
          data.nickname,
          data.gender,
          data.role,
          data.status,
          data.email,
          data.phone,
          data.incoming_year,
          data.college_year,
          data.high_school,
          data.university,
          data.faculty,
          data.major,
          data.birth_place,
          data.birth_date,
          data.full_address,
          data.village,
          data.district,
          data.city,
          data.province,
          data.created_at,
          data.updated_at,
        ];

        await connection.query(query, values);
        await connection.commit();

        successCount++;
        logger.info(`Berhasil menyimpan data: ${data.fullname} (${successCount}/${results.length})`);

        // Tambahkan jeda 100ms setelah setiap insert
        await delay(100);
      } catch (error) {
        await connection.rollback();
        errorCount++;
        logger.error(`Error menyimpan santri ${santri.nickname || '(tanpa nama)'}: ${error.message}`);
      } finally {
        connection.release();
      }
    }

    logger.info(`Import selesai: ${successCount} sukses, ${errorCount} gagal`);
    console.log(`Import selesai: ${successCount} sukses, ${errorCount} gagal`);
  } catch (error) {
    logger.error(`Error saat memproses file CSV: ${error.message}`);
    console.error('Error saat memproses file CSV:', error);
  }
}

// Fungsi untuk membuat tabel jika belum ada
async function createTableIfNotExists() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS santri (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) UNIQUE,
        fullname VARCHAR(100) NOT NULL,
        nickname VARCHAR(50),
        gender VARCHAR(10),
        role VARCHAR(20),
        status VARCHAR(10) DEFAULT 'active',
        email VARCHAR(100),
        phone VARCHAR(20),
        incoming_year VARCHAR(4),
        college_year VARCHAR(4),
        high_school VARCHAR(100),
        university VARCHAR(100),
        faculty VARCHAR(100),
        major VARCHAR(100),
        birth_place VARCHAR(50),
        birth_date DATE,
        full_address TEXT,
        village VARCHAR(50),
        district VARCHAR(50),
        city VARCHAR(50),
        province VARCHAR(50),
        created_at DATETIME,
        updated_at DATETIME,
        INDEX idx_code (code),
        INDEX idx_role (role),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(query);
    logger.info('Tabel santri berhasil dibuat atau sudah ada');
  } catch (error) {
    logger.error(`Error saat membuat tabel santri: ${error.message}`);
    throw error;
  }
}

export default importSantriData;
