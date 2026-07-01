const { Category } = require('../models');

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

const getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json(category);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create category',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.update(req.body);
    return res.json(category);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update category',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory
};