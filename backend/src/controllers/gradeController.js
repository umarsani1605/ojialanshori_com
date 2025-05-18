import GradeModel from '../models/gradeModel.js';
import GradeCategoryModel from '../models/gradeCategoryModel.js';
import GradeSubjectModel from '../models/gradeSubjectModel.js';
import GradePentashihModel from '../models/gradePentashihModel.js';
import SantriModel from '../models/santriModel.js';
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

  // =================================================================
  // ===================== CATEGORY CONTROLLER =======================
  // =================================================================

  // Get all categories
  static async getAllCategory(req, res) {
    try {
      const category = await GradeCategoryModel.getAllCategory();

      res.status(200).json({
        status: 'success',
        data: category.map((item, index) => ({
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

  // Get single category by ID
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const category = await GradeCategoryModel.getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Kategori tidak ditemukan',
        });
      }

      res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Create new category
  static async createCategory(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          status: 'error',
          message: 'Category name is required',
        });
      }

      const newCategory = await GradeCategoryModel.createCategory({ name });

      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: newCategory,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Update category
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          status: 'error',
          message: 'Nama kategori harus diisi',
        });
      }

      // Check if category exists
      const existingCategory = await GradeCategoryModel.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
      }

      const updatedCategory = await GradeCategoryModel.updateCategory(id, { name });

      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: updatedCategory,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Delete category
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      // Check if category exists
      const existingCategory = await GradeCategoryModel.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
      }

      await GradeCategoryModel.deleteCategory(id);

      res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // =================================================================
  // ===================== SUBJECT CONTROLLER ========================
  // =================================================================

  // Get all subjects
  static async getAllSubject(req, res) {
    try {
      const subjects = await GradeSubjectModel.getAllSubject();

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
      const subject = await GradeSubjectModel.getSubjectById(id);

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

      const newSubject = await GradeSubjectModel.createSubject({
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

      const existingSubject = await GradeSubjectModel.getSubjectById(id);
      if (!existingSubject) {
        return res.status(404).json({
          status: 'error',
          message: 'Subject tidak ditemukan',
        });
      }

      const updatedSubject = await GradeSubjectModel.updateSubject(id, {
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

      const existingSubject = await GradeSubjectModel.getSubjectById(id);
      if (!existingSubject) {
        return res.status(404).json({
          status: 'error',
          message: 'Subject tidak ditemukan',
        });
      }

      await GradeSubjectModel.deleteSubject(id);

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

      const subjects = await GradeSubjectModel.getSubjectByCategory(category_id);

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

  // =================================================================
  // ===================== PENTASHIH CONTROLLER ======================
  // =================================================================

  // Get all pentashih
  static async getAllPentashih(req, res) {
    try {
      const pentashih = await GradePentashihModel.getAllPentashih();

      res.status(200).json({
        status: 'success',
        data: pentashih.map((item, index) => ({
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

  // Get single pentashih by ID
  static async getPentashihById(req, res) {
    try {
      const { id } = req.params;
      const pentashih = await GradePentashihModel.getPentashihById(id);

      if (!pentashih) {
        return res.status(404).json({
          status: 'error',
          message: 'Pentashih tidak ditemukan',
        });
      }

      res.status(200).json({
        status: 'success',
        data: pentashih,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Create new pentashih
  static async createPentashih(req, res) {
    try {
      const { id_pentashih, santri_ids } = req.body;

      if (!id_pentashih) {
        return res.status(400).json({
          status: 'error',
          message: 'ID Pentashih harus diisi',
        });
      }

      const newPentashih = await GradePentashihModel.createPentashih({
        id_pentashih,
        santri_ids,
      });

      res.status(201).json({
        status: 'success',
        message: 'Pentashih berhasil ditambahkan',
        data: newPentashih,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Update pentashih
  static async updatePentashih(req, res) {
    try {
      const { id } = req.params;
      const santri_ids = req.body;

      console.log('id: ' + id);
      console.log('santri_ids: ' + santri_ids);

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID Pentashih harus diisi',
        });
      }

      const updatedPentashih = await GradePentashihModel.updatePentashih(id, santri_ids);

      res.status(200).json({
        status: 'success',
        message: 'Pentashih berhasil diupdate',
        data: updatedPentashih,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Delete pentashih
  static async deletePentashih(req, res) {
    try {
      const { id } = req.params;

      const existingPentashih = await GradePentashihModel.getPentashihById(id);
      if (!existingPentashih) {
        return res.status(404).json({
          status: 'error',
          message: 'Pentashih tidak ditemukan',
        });
      }

      await GradePentashihModel.deletePentashih(id);

      res.status(200).json({
        status: 'success',
        message: 'Pentashih berhasil dihapus',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Get santri by pentashih ID
  static async getSantriByPentashihId(req, res) {
    try {
      const { id } = req.params;
      const santriList = await GradePentashihModel.getSantriByPentashihId(id);

      res.status(200).json({
        status: 'success',
        data: santriList,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Get grades by santri code
  static async getGradesByCode(req, res) {
    try {
      const { code } = req.params;
      logger.info('Getting grades for santri code:', code);

      // Cari santri berdasarkan kode
      const santri = await SantriModel.getSantriByCode(code);
      
      if (!santri) {
        logger.warn('Santri not found with code:', code);
        return res.status(404).json({
          status: 'error',
          message: 'Santri tidak ditemukan',
        });
      }

      // Ambil semua data yang diperlukan
      const [grades, categories, subjects] = await Promise.all([
        GradeModel.getAllGrades({ id_santri: santri.id }),
        GradeCategoryModel.getAllCategory(),
        GradeSubjectModel.getAllSubject(),
      ]);

      // Format response
      const response = {
        santri: {
          code: santri.code,
          fullname: santri.fullname,
          college_year: santri.college_year,
          university: santri.university,
          faculty: santri.faculty,
          major: santri.major,
        },
        categories: categories.map(category => ({
          ...category,
          subjects: subjects
            .filter(subject => subject.id_category === category.id)
            .map(subject => {
              const grade = grades.find(g => g.id_subject === subject.id);
              return {
                ...subject,
                hafalan: grade?.hafalan || 'belum',
                setoran: grade?.setoran || 'belum',
              };
            }),
        })),
      };

      logger.info('Successfully retrieved grades for santri');
      res.status(200).json({
        status: 'success',
        data: response,
      });
    } catch (error) {
      logger.error('Controller Error: Failed to get grades by code:', error);
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }
}

export default GradeController;
