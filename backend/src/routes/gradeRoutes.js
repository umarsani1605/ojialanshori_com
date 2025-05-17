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
 */

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
 * /grades/{id}:
 *   get:
 *     summary: Mengambil detail grade berdasarkan ID
 */
router.get('/:id', GradeController.getGradeById);

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
