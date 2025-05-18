import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/database.js';
import { specs } from './utils/swagger.js';

import santriRoutes from './routes/santriRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes akan ditambahkan di sini nanti
app.use('/auth', authRoutes);
app.use('/santri', santriRoutes);
app.use('/grades', gradeRoutes);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error handling untuk route tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route tidak ditemukan',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Terjadi kesalahan pada server',
  });
});

const port = process.env.PORT || 8000;

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
  .on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
