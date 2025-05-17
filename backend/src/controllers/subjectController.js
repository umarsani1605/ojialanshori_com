import SubjectModel from '../models/subjectModel.js';
import logger from '../utils/logger.js';

class SubjectController {
  // Get all subjects
  static async getAllSubject(req, res) {
    try {
      const subjects = await SubjectModel.getAllSubject();

      res.status(200).json({
        status: 'success',
        data: subjects.map((item, index) => ({
          id: index + 1,
          ...item,
        })),
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Get single subject by ID
  static async getSubjectById(req, res) {
    try {
      const { id } = req.params;
      const subject = await SubjectModel.getSubjectById(id);

      if (!subject) {
        return res.status(404).json({
          status: 'error',
          message: 'Subject tidak ditemukan',
        });
      }

      res.status(200).json({
        status: 'success',
        data: subject,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Create new subject
  static async createSubject(req, res) {
    try {
      const { name, id_category, has_hafalan, has_setoran } = req.body;

      if (!name || !id_category) {
        return res.status(400).json({
          status: 'error',
          message: 'Nama dan kategori harus diisi',
        });
      }

      const newSubject = await SubjectModel.createSubject({
        name,
        id_category,
        has_hafalan,
        has_setoran,
      });

      res.status(201).json({
        status: 'success',
        message: 'Subject berhasil ditambahkan',
        data: newSubject,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Update subject
  static async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const { name, id_category, has_hafalan, has_setoran } = req.body;

      if (!name || !id_category) {
        return res.status(400).json({
          status: 'error',
          message: 'Nama dan kategori harus diisi',
        });
      }

      const existingSubject = await SubjectModel.getSubjectById(id);
      if (!existingSubject) {
        return res.status(404).json({
          status: 'error',
          message: 'Subject tidak ditemukan',
        });
      }

      const updatedSubject = await SubjectModel.updateSubject(id, {
        name,
        id_category,
        has_hafalan,
        has_setoran,
      });

      res.status(200).json({
        status: 'success',
        message: 'Subject berhasil diupdate',
        data: updatedSubject,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Delete subject
  static async deleteSubject(req, res) {
    try {
      const { id } = req.params;

      const existingSubject = await SubjectModel.getSubjectById(id);
      if (!existingSubject) {
        return res.status(404).json({
          status: 'error',
          message: 'Subject tidak ditemukan',
        });
      }

      await SubjectModel.deleteSubject(id);

      res.status(200).json({
        status: 'success',
        message: 'Subject berhasil dihapus',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Get subjects by category
  static async getSubjectByCategory(req, res) {
    try {
      const { category_id } = req.params;
      logger.info('Getting subjects for category:', category_id);

      const subjects = await SubjectModel.getSubjectByCategory(category_id);

      logger.info(`Successfully retrieved ${subjects.length} subjects for category ${category_id}`);
      res.status(200).json({
        status: 'success',
        data: subjects.map((item, index) => ({
          index: index + 1,
          ...item,
        })),
      });
    } catch (error) {
      logger.error('Controller Error: Failed to get subjects by category:', error);
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }
}

export default SubjectController;
