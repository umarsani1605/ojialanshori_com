import express from 'express';
import CategoryController from '../controllers/categoryController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generated untuk kategori
 *         name:
 *           type: string
 *           description: Nama kategori
 *       example:
 *         id: 1
 *         name: Al-Qur'an
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Mengambil semua data kategori
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Nomor halaman untuk pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Berhasil mengambil data kategori
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
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/', CategoryController.getAllCategory);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Mengambil data kategori berdasarkan ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kategori
 *     responses:
 *       200:
 *         description: Berhasil mengambil data kategori
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.get('/:id', CategoryController.getCategoryById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Menambah kategori baru
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *     responses:
 *       201:
 *         description: Kategori berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Data kategori berhasil ditambahkan
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Data tidak valid
 */
router.post('/', CategoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Mengupdate data kategori
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kategori
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data kategori berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.put('/:id', CategoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Menghapus data kategori
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kategori
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Data kategori berhasil dihapus
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.delete('/:id', CategoryController.deleteCategory);

export default router;
