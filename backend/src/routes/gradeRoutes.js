import express from 'express';
import GradeController from '../controllers/gradeController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - id_santri
 *         - id_pentashih
 *         - id_category
 *         - id_subject
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generated untuk grade
 *         id_santri:
 *           type: integer
 *           description: ID santri
 *         id_pentashih:
 *           type: integer
 *           description: ID pentashih
 *         id_category:
 *           type: integer
 *           description: ID kategori
 *         id_subject:
 *           type: integer
 *           description: ID mata pelajaran
 *         hafalan:
 *           type: string
 *           enum: [belum, proses, sudah]
 *           description: Status hafalan
 *         setoran:
 *           type: string
 *           enum: [belum, proses, sudah]
 *           description: Status setoran
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

// ===== ROUTE UNTUK KATEGORI =====

/**
 * @swagger
 * /grades/categories:
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
 */
router.get('/categories', GradeController.getAllCategory);

/**
 * @swagger
 * /grades/categories/{id}:
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
 */
router.get('/categories/:id', GradeController.getCategoryById);

/**
 * @swagger
 * /grades/categories:
 *   post:
 *     summary: Menambah kategori baru
 *     tags: [Category]
 */
router.post('/categories', GradeController.createCategory);

/**
 * @swagger
 * /grades/categories/{id}:
 *   put:
 *     summary: Mengupdate data kategori
 *     tags: [Category]
 */
router.put('/categories/:id', GradeController.updateCategory);

/**
 * @swagger
 * /grades/categories/{id}:
 *   delete:
 *     summary: Menghapus data kategori
 *     tags: [Category]
 */
router.delete('/categories/:id', GradeController.deleteCategory);

// ===== ROUTE UNTUK SUBJECT =====

/**
 * @swagger
 * /grades/subjects:
 *   get:
 *     summary: Mengambil semua data subject
 *     tags: [Subject]
 */
router.get('/subjects', GradeController.getAllSubject);

/**
 * @swagger
 * /grades/subjects/{id}:
 *   get:
 *     summary: Mengambil data subject berdasarkan ID
 *     tags: [Subject]
 */
router.get('/subjects/:id', GradeController.getSubjectById);

/**
 * @swagger
 * /grades/subjects:
 *   post:
 *     summary: Menambah subject baru
 *     tags: [Subject]
 */
router.post('/subjects', GradeController.createSubject);

/**
 * @swagger
 * /grades/subjects/{id}:
 *   put:
 *     summary: Mengupdate data subject
 *     tags: [Subject]
 */
router.put('/subjects/:id', GradeController.updateSubject);

/**
 * @swagger
 * /grades/subjects/{id}:
 *   delete:
 *     summary: Menghapus data subject
 *     tags: [Subject]
 */
router.delete('/subjects/:id', GradeController.deleteSubject);

/**
 * @swagger
 * /grades/subjects/category/{category_id}:
 *   get:
 *     summary: Mengambil daftar mata pelajaran berdasarkan kategori
 *     tags: [Subjects]
 */
router.get('/subjects/category/:category_id', GradeController.getSubjectByCategory);

// ===== ROUTE UNTUK PENTASHIH =====

/**
 * @swagger
 * /grades/pentashih:
 *   get:
 *     summary: Mengambil semua data pentashih
 *     tags: [Pentashih]
 */
router.get('/pentashih', GradeController.getAllPentashih);

/**
 * @swagger
 * /grades/pentashih/{id}:
 *   get:
 *     summary: Mengambil data pentashih berdasarkan ID
 *     tags: [Pentashih]
 */
router.get('/pentashih/:id', GradeController.getPentashihById);

/**
 * @swagger
 * /grades/pentashih/{id}/santri:
 *   get:
 *     summary: Mengambil daftar santri yang dibimbing oleh pentashih
 *     tags: [Pentashih]
 */
router.get('/pentashih/:id/santri', GradeController.getSantriByPentashihId);

/**
 * @swagger
 * /grades/pentashih:
 *   post:
 *     summary: Menambah pentashih baru
 *     tags: [Pentashih]
 */
router.post('/pentashih', GradeController.createPentashih);

/**
 * @swagger
 * /grades/pentashih/{id}:
 *   put:
 *     summary: Mengupdate data pentashih
 *     tags: [Pentashih]
 */
router.put('/pentashih/:id', GradeController.updatePentashih);

/**
 * @swagger
 * /grades/pentashih/{id}:
 *   delete:
 *     summary: Menghapus data pentashih
 *     tags: [Pentashih]
 */
router.delete('/pentashih/:id', GradeController.deletePentashih);

// ===== ROUTE UNTUK GRADE =====

/**
 * @swagger
 * /grades:
 *   get:
 *     summary: Mengambil semua data grade
 *     tags: [Grades]
 *     parameters:
 *       - in: query
 *         name: id_santri
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID santri
 *       - in: query
 *         name: id_pentashih
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID pentashih
 *       - in: query
 *         name: id_category
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID kategori
 *       - in: query
 *         name: id_subject
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID mata pelajaran
 */
router.get('/', GradeController.getAllGrades);

/**
 * @swagger
 * /grades:
 *   post:
 *     summary: Menambah grade baru
 */
router.post('/', GradeController.createGrade);

/**
 * @swagger
 * /grades/{id}:
 *   get:
 *     summary: Mengambil detail grade berdasarkan ID
 */
router.get('/:id', GradeController.getGradeById);

/**
 * @swagger
 * /grades/{id}:
 *   put:
 *     summary: Mengupdate grade
 */
router.put('/:id', GradeController.updateGrade);

/**
 * @swagger
 * /grades/{id}:
 *   delete:
 *     summary: Menghapus grade
 */
router.delete('/:id', GradeController.deleteGrade);

export default router;
