import express from 'express';
import StatisticController from '../controllers/statisticController.js';

const router = express.Router();

/**
 * @swagger
 * /statistics/dashboard:
 *   get:
 *     summary: Mendapatkan statistik dashboard
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan statistik
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     newRegistrants:
 *                       type: integer
 *                       example: 45
 *                     activeSantri:
 *                       type: integer
 *                       example: 320
 *                     genderDistribution:
 *                       type: object
 *                       properties:
 *                         male:
 *                           type: integer
 *                           example: 180
 *                         female:
 *                           type: integer
 *                           example: 140
 *                     yearlyDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           college_year:
 *                             type: string
 *                             example: "2024"
 *                           total:
 *                             type: integer
 *                             example: 40
 */
router.get('/dashboard', StatisticController.getDashboardStats);

export default router; 