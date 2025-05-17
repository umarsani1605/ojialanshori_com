import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ojialanshori_com',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi database
db.getConnection()
  .then((connection) => {
    console.log('Database terhubung dengan sukses!');
    connection.release();
  })
  .catch((error) => {
    console.error('Error koneksi database:', error);
  });

export const config = {
  db: db,
};
