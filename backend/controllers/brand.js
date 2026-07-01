const { Brand } = require('../models');

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({ order: [['name', 'ASC']] });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brands', error: error.message });
  }
};

const getSingleBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brand', error: error.message });
  }
};

const createBrand = async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create brand', error: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    await brand.update(req.body);
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update brand', error: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    await brand.destroy();
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete brand', error: error.message });
  }
};

module.exports = {
  getAllBrands,
  getSingleBrand,
  createBrand,
  updateBrand,
  deleteBrand
};