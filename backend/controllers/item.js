const { Item, Stock } = require('../models');

// Matches your route names exactly
const getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [{ model: Stock, as: 'Stock', attributes: ['quantity'] }]
    });

    const formattedRows = items.map(item => {
      const plainItem = item.toJSON();
      return {
        ...plainItem,
        quantity: plainItem.Stock ? plainItem.Stock.quantity : 0
      };
    });

    res.status(200).json({ rows: formattedRows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getSingleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id, {
      include: [{ model: Stock, as: 'Stock', attributes: ['quantity'] }]
    });

    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const plainItem = item.toJSON();
    const formattedResult = [{
      ...plainItem,
      quantity: plainItem.Stock ? plainItem.Stock.quantity : 0
    }];

    res.status(200).json({ result: formattedResult, img_path: plainItem.img_path });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createItem = async (req, res) => {
  try {
    const { description, brand, category, cost_price, sell_price, quantity, specs } = req.body;
    const img_path = req.file ? `uploads/${req.file.filename}` : 'uploads/default-gadget.png';

    const newItem = await Item.create({
      description, brand, category, cost_price, sell_price, img_path, specs: specs || null
    });

    await Stock.create({
      item_id: newItem.item_id,
      quantity: quantity ? Number(quantity) : 0
    });

    res.status(201).json({ success: true, message: "Gadget added successfully!", item_id: newItem.item_id });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, brand, category, cost_price, sell_price, quantity, specs } = req.body;

    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Gadget record not found" });

    await item.update({
      description, brand, category, cost_price, sell_price,
      img_path: req.file ? `uploads/${req.file.filename}` : item.img_path,
      specs: specs || item.specs
    });

    if (quantity !== undefined) {
      await Stock.upsert({
        item_id: id,
        quantity: Number(quantity)
      });
    }

    res.status(200).json({ success: true, message: "Gadget updated successfully!" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await Item.destroy({ where: { item_id: id } });

    if (affectedRows === 0) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product removed from database inventory!" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Check this object export line carefully! It must contain these exact names.
module.exports = {
  getAllItems,
  getSingleItem,
  createItem,
  updateItem,
  deleteItem
};