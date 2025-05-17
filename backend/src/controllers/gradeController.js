import GradeModel from '../models/gradeModel.js';
import logger from '../utils/logger.js';

class GradeController {
  // Get all grades dengan filter
  static async getAllGrades(req, res) {
    try {
      const filters = req.query;
      logger.info('Getting all grades with filters:', filters);

      const grades = await GradeModel.getAllGrades(filters);

      logger.info(`Successfully retrieved ${grades.length} grades`);
      res.status(200).json({
        status: 'success',
        data: grades.map((item, index) => ({
          index: index + 1,
          ...item,
        })),
      });
    } catch (error) {
      logger.error('Controller Error: Failed to get grades:', error);
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Get single grade by ID
  static async getGradeById(req, res) {
    try {
      const { id } = req.params;
      logger.info('Getting grade by ID:', id);

      const grade = await GradeModel.getGradeById(id);

      if (!grade) {
        logger.warn('Grade not found with ID:', id);
        return res.status(404).json({
          status: 'error',
          message: 'Grade tidak ditemukan',
        });
      }

      logger.info('Successfully retrieved grade');
      res.status(200).json({
        status: 'success',
        data: grade,
      });
    } catch (error) {
      logger.error('Controller Error: Failed to get grade by ID:', error);
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Create new grade
  static async createGrade(req, res) {
    try {
      const gradeData = req.body;
      logger.info('Creating new grade with data:', gradeData);

      // Validasi input
      if (!gradeData.id_santri || !gradeData.id_pentashih || !gradeData.id_category || !gradeData.id_subject) {
        logger.warn('Invalid grade data:', gradeData);
        return res.status(400).json({
          status: 'error',
          message: 'Semua field harus diisi',
        });
      }

      const newGrade = await GradeModel.createGrade(gradeData);

      logger.info('Successfully created new grade');
      res.status(201).json({
        status: 'success',
        message: 'Grade berhasil ditambahkan',
        data: newGrade,
      });
    } catch (error) {
      logger.error('Controller Error: Failed to create grade:', error);
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Update grade
  static async updateGrade(req, res) {
    try {
      const { id } = req.params;
      const gradeData = req.body;
      logger.info(`Updating grade ${id} with data:`, gradeData);

      const updatedGrade = await GradeModel.updateGrade(id, gradeData);

      logger.info('Successfully updated grade');
      res.status(200).json({
        status: 'success',
        message: 'Grade berhasil diupdate',
        data: updatedGrade,
      });
    } catch (error) {
      logger.error('Controller Error: Failed to update grade:', error);
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Delete grade
  static async deleteGrade(req, res) {
    try {
      const { id } = req.params;
      logger.info('Deleting grade with ID:', id);

      await GradeModel.deleteGrade(id);

      logger.info('Successfully deleted grade');
      res.status(200).json({
        status: 'success',
        message: 'Grade berhasil dihapus',
      });
    } catch (error) {
      logger.error('Controller Error: Failed to delete grade:', error);
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }
}

export default GradeController;
