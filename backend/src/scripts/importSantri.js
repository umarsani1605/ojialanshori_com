#!/usr/bin/env node

import importSantriData from '../utils/importSantriData.js';
import { db } from '../config/database.js';

console.log('Mulai mengimpor data santri dari CSV...');

// Jalankan fungsi import
importSantriData()
  .then(() => {
    console.log('Proses import telah dimulai. Lihat log untuk detail');
    // Biarkan koneksi database tetap terbuka selama proses import berjalan
    setTimeout(() => {
      console.log('Menutup koneksi database...');
      db.end();
      process.exit(0);
    }, 10000); // Tunggu 10 detik untuk memastikan proses import selesai
  })
  .catch((error) => {
    console.error('Terjadi kesalahan:', error);
    db.end();
    process.exit(1);
  });
