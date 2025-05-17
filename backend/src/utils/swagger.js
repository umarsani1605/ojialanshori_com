import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistem Penilaian Pesantren',
      version: '1.0.0',
      description: 'Dokumentasi API untuk sistem penilaian pesantren',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path ke file routes
};

export const specs = swaggerJsdoc(options);
