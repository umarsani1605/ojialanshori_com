# Backend Aplikasi Pondok Pesantren

## Penyelarasan Data Santri

### Import Data dari CSV

Untuk mengimpor data santri dari file CSV ke database, ikuti langkah-langkah berikut:

1. Pastikan package dependencies telah diinstall:
   ```
   npm install
   ```

2. Siapkan file CSV dengan nama `data_santri.csv` di folder root backend

3. Jalankan script import:
   ```
   node src/scripts/importSantri.js
   ```

Script akan otomatis:
- Membuat tabel santri jika belum ada
- Membaca file CSV dari root folder backend
- Memasukkan data ke database
- Melakukan update jika data sudah ada (berdasarkan kode santri)

### Struktur Tabel Santri

Tabel santri memiliki struktur sebagai berikut:

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT | Primary key, auto increment |
| code | VARCHAR(10) | Kode unik santri |
| fullname | VARCHAR(100) | Nama lengkap santri |
| nickname | VARCHAR(50) | Nama panggilan |
| gender | VARCHAR(10) | Jenis kelamin (male/female) |
| role | VARCHAR(20) | Peran (santri, pentashih, dll) |
| status | VARCHAR(10) | Status (active/inactive) |
| email | VARCHAR(100) | Email |
| phone | VARCHAR(20) | Nomor telepon |
| incoming_year | VARCHAR(4) | Tahun masuk |
| college_year | VARCHAR(4) | Tahun kuliah |
| high_school | VARCHAR(100) | Asal SMA/MA |
| university | VARCHAR(100) | Universitas |
| faculty | VARCHAR(100) | Fakultas |
| major | VARCHAR(100) | Jurusan |
| birth_place | VARCHAR(50) | Tempat lahir |
| birth_date | VARCHAR(20) | Tanggal lahir |
| full_address | TEXT | Alamat lengkap |
| village | VARCHAR(50) | Desa/Kelurahan |
| district | VARCHAR(50) | Kecamatan |
| city | VARCHAR(50) | Kota/Kabupaten |
| province | VARCHAR(50) | Provinsi |
| created_at | DATETIME | Waktu pembuatan |
| updated_at | DATETIME | Waktu update | 