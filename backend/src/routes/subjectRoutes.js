import express from 'express';
import SubjectController from '../controllers/subjectController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       required:
 *         - name
 *         - id_category
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generated untuk subject
 *         name:
 *           type: string
 *           description: Nama subject
 *         id_category:
 *           type: integer
 *           description: ID kategori
 *         has_hafalan:
 *           type: boolean
 *           description: Memiliki hafalan atau tidak
 *         has_setoran:
 *           type: boolean
 *           description: Memiliki setoran atau tidak
 */

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Mengambil semua data subject
 *     tags: [Subject]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data subject
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
 *                     $ref: '#/components/schemas/Subject'
 */
router.get('/', SubjectController.getAllSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   get:
 *     summary: Mengambil data subject berdasarkan ID
 *     tags: [Subject]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil data subject
 *       404:
 *         description: Subject tidak ditemukan
 */
router.get('/:id', SubjectController.getSubjectById);

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Menambah subject baru
 *     tags: [Subject]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       201:
 *         description: Subject berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 */
router.post('/', SubjectController.createSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   put:
 *     summary: Mengupdate data subject
 *     tags: [Subject]
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
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       200:
 *         description: Subject berhasil diupdate
 *       404:
 *         description: Subject tidak ditemukan
 */
router.put('/:id', SubjectController.updateSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Menghapus data subject
 *     tags: [Subject]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subject berhasil dihapus
 *       404:
 *         description: Subject tidak ditemukan
 */
router.delete('/:id', SubjectController.deleteSubject);

/**
 * @swagger
 * /subjects/category/{category_id}:
 *   get:
 *     summary: Mengambil daftar mata pelajaran berdasarkan kategori
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kategori
 *     responses:
 *       200:
 *         description: Berhasil mengambil data mata pelajaran
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
 *                     $ref: '#/components/schemas/Subject'
 */
router.get('/category/:category_id', SubjectController.getSubjectByCategory);

export default router;
