import CategoryModel from '../models/categoryModel.js';

class CategoryController {
  // Get all categories
  static async getAllCategory(req, res) {
    try {
      const category = await CategoryModel.getAllCategory();

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

      const category = await CategoryModel.getCategoryById(id);

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

      const newCategory = await CategoryModel.createCategory({ name });

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
      const existingCategory = await CategoryModel.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
      }

      const updatedCategory = await CategoryModel.updateCategory(id, { name });

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
      const existingCategory = await CategoryModel.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
      }

      await CategoryModel.deleteCategory(id);

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
}

export default CategoryController;
