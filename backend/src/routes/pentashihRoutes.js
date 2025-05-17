import express from 'express';
import PentashihController from '../controllers/pentashihController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pentashih:
 *       type: object
 *       required:
 *         - id_pentashih
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generated untuk pentashih
 *         id_pentashih:
 *           type: integer
 *           description: ID santri yang menjadi pentashih
 *         santri_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array ID santri yang dibimbing
 */

/**
 * @swagger
 * /pentashih:
 *   get:
 *     summary: Mengambil semua data pentashih
 *     tags: [Pentashih]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data pentashih
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pentashih'
 */
router.get('/', PentashihController.getAllPentashih);

/**
 * @swagger
 * /pentashih/{id}:
 *   get:
 *     summary: Mengambil data pentashih berdasarkan ID
 *     tags: [Pentashih]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil data pentashih
 *       404:
 *         description: Pentashih tidak ditemukan
 */
router.get('/:id', PentashihController.getPentashihById);

/**
 * @swagger
 * /pentashih/{id}/santri:
 *   get:
 *     summary: Mengambil daftar santri yang dibimbing oleh pentashih
 *     tags: [Pentashih]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar santri
 */
router.get('/:id/santri', PentashihController.getSantriByPentashihId);

/**
 * @swagger
 * /pentashih:
 *   post:
 *     summary: Menambah pentashih baru
 *     tags: [Pentashih]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pentashih'
 *     responses:
 *       201:
 *         description: Pentashih berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 */
router.post('/', PentashihController.createPentashih);

/**
 * @swagger
 * /pentashih/{id}:
 *   put:
 *     summary: Mengupdate data pentashih
 *     tags: [Pentashih]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pentashih'
 *     responses:
 *       200:
 *         description: Pentashih berhasil diupdate
 *       404:
 *         description: Pentashih tidak ditemukan
 */
router.put('/:id', PentashihController.updatePentashih);

/**
 * @swagger
 * /pentashih/{id}:
 *   delete:
 *     summary: Menghapus data pentashih
 *     tags: [Pentashih]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pentashih berhasil dihapus
 *       404:
 *         description: Pentashih tidak ditemukan
 */
router.delete('/:id', PentashihController.deletePentashih);

export default router;
