import express from 'express';
import SantriController from '../controllers/santriController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Santri:
 *       type: object
 *       required:
 *         - fullname
 *         - gender
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generated untuk santri
 *         code:
 *           type: string
 *           description: Kode unik santri
 *         fullname:
 *           type: string
 *           description: Nama lengkap santri
 *         nickname:
 *           type: string
 *           description: Nama panggilan
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: Jenis kelamin santri (male/female)
 *         role:
 *           type: string
 *           enum: [santri, pentashih]
 *           description: Peran santri
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Status santri (active/inactive)
 *         email:
 *           type: string
 *           description: Alamat email
 *         phone:
 *           type: string
 *           description: Nomor telepon
 *         incoming_year:
 *           type: string
 *           description: Tahun masuk
 *         college_year:
 *           type: string
 *           description: Tahun kuliah
 *         university:
 *           type: string
 *           description: Universitas
 *         faculty:
 *           type: string
 *           description: Fakultas
 *         major:
 *           type: string
 *           description: Jurusan
 *       example:
 *         id: 1
 *         code: A2301
 *         fullname: Ahmad Fajar
 *         nickname: Fajar
 *         gender: male
 *         role: santri
 *         status: active
 *         email: fajar@example.com
 *         phone: "08123456789"
 *         incoming_year: "2023"
 */

/**
 * @swagger
 * /santri:
 *   get:
 *     summary: Mengambil semua data santri
 *     tags: [Santri]
 *     parameters:
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female]
 *         description: Filter berdasarkan jenis kelamin (male/female)
 *       - in: query
 *         name: assigned
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status pentashih (true=sudah punya pentashih, false=belum punya pentashih)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [santri, pentashih]
 *         description: Filter berdasarkan role
 *     responses:
 *       200:
 *         description: Berhasil mengambil data santri
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
 *                     $ref: '#/components/schemas/Santri'
 */
router.get('/', SantriController.getAllSantri);


/**
 * @swagger
 * /santri/role:
 *   put:
 *     summary: Update role santri
 *     tags: [Santri]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               role:
 *                 type: string
 */
router.put('/role', SantriController.updateRole);

/**
 * @swagger
 * /santri/{id}:
 *   get:
 *     summary: Mengambil data santri berdasarkan ID
 *     tags: [Santri]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID santri
 *     responses:
 *       200:
 *         description: Berhasil mengambil data santri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Santri'
 *       404:
 *         description: Santri tidak ditemukan
 */
router.get('/:id', SantriController.getSantriById);

/**
 * @swagger
 * /santri:
 *   post:
 *     summary: Menambah santri baru
 *     tags: [Santri]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *               gender:
 *                 type: string
 *                 enum: [L, P]
 *     responses:
 *       201:
 *         description: Santri berhasil ditambahkan
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
 *                   example: Data santri berhasil ditambahkan
 *                 data:
 *                   $ref: '#/components/schemas/Santri'
 *       400:
 *         description: Data tidak valid
 */
router.post('/', SantriController.createSantri);

/**
 * @swagger
 * /santri/{id}:
 *   put:
 *     summary: Mengupdate data santri
 *     tags: [Santri]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID santri
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [L, P]
 *     responses:
 *       200:
 *         description: Data santri berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Santri'
 *       404:
 *         description: Santri tidak ditemukan
 */
router.put('/:id', SantriController.updateSantri);

/**
 * @swagger
 * /santri/{id}:
 *   delete:
 *     summary: Menghapus data santri
 *     tags: [Santri]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID santri
 *     responses:
 *       200:
 *         description: Santri berhasil dihapus
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
 *                   example: Data santri berhasil dihapus
 *       404:
 *         description: Santri tidak ditemukan
 */
router.delete('/:id', SantriController.deleteSantri);

/**
 * @swagger
 * /santri/search:
 *   get:
 *     summary: Mencari santri berdasarkan nama
 *     tags: [Santri]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *     responses:
 *       200:
 *         description: Santri ditemukan
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
 *                     $ref: '#/components/schemas/Santri'
 *       400:
 *         description: Parameter tidak valid
 */
router.get('/search', SantriController.searchSantri);

export default router;
