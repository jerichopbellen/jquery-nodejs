const { Item, Stock, Brand, Category } = require('../models');

// 1. GET ALL ITEMS (With Normalized Eager Loading)
const getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        { model: Stock, as: 'Stock', attributes: ['quantity'] },
        { model: Brand, as: 'brandInfo', attributes: ['name'] },
        { model: Category, as: 'categoryInfo', attributes: ['name'] }
      ]
    });

    const formattedRows = items.map(item => {
      const plainItem = item.toJSON();
      return {
        ...plainItem,
        // Safeguard flat properties for backwards compatibility with DataTables columns
        brand: plainItem.brandInfo ? plainItem.brandInfo.name : 'Generic',
        category: plainItem.categoryInfo ? plainItem.categoryInfo.name : 'Uncategorized',
        quantity: plainItem.Stock ? plainItem.Stock.quantity : 0
      };
    });

    res.status(200).json({ rows: formattedRows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 2. GET SINGLE ITEM
const getSingleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id, {
      include: [
        { model: Stock, as: 'Stock', attributes: ['quantity'] },
        { model: Brand, as: 'brandInfo', attributes: ['name'] },
        { model: Category, as: 'categoryInfo', attributes: ['name'] }
      ]
    });

    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const plainItem = item.toJSON();
    const formattedResult = [{
      ...plainItem,
      brand: plainItem.brandInfo ? plainItem.brandInfo.name : 'Generic',
      category: plainItem.categoryInfo ? plainItem.categoryInfo.name : 'Uncategorized',
      quantity: plainItem.Stock ? plainItem.Stock.quantity : 0
    }];

    res.status(200).json({ result: formattedResult, img_path: plainItem.img_path });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 3. CREATE ITEM
const createItem = async (req, res) => {
  try {
    // Destructure using relational IDs sent from front-end select tags
    const { description, brand_id, category_id, cost_price, sell_price, quantity, specs } = req.body;

    if (!description || !cost_price || !sell_price) {
      return res.status(400).json({ success: false, message: "Description, Cost Price, and Sell Price are required." });
    }

    // Safely structure JSON payload
    let parsedSpecs = {};
    if (specs && specs.trim() !== "") {
      try {
        parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid JSON format in Specifications." });
      }
    }

    const item = await Item.create({
      description,
      brand_id: brand_id ? Number(brand_id) : null,
      category_id: category_id ? Number(category_id) : null,
      cost_price: Number(cost_price),
      sell_price: Number(sell_price),
      img_path: req.file ? `images/${req.file.filename}` : 'images/default-gadget.jpg',
      specs: parsedSpecs
    });

    // Create tracking stock row
    await Stock.create({
      item_id: item.item_id,
      quantity: quantity ? Number(quantity) : 0
    });

    res.status(201).json({ success: true, message: "Gadget created successfully!", item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 4. UPDATE ITEM
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, brand_id, category_id, cost_price, sell_price, quantity, specs } = req.body;

    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Gadget record not found" });

    let parsedSpecs = item.specs;
    if (specs && specs.trim() !== "") {
      try {
        parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid JSON format in Specifications." });
      }
    }

    await item.update({
      description: description || item.description,
      brand_id: brand_id ? Number(brand_id) : item.brand_id,
      category_id: category_id ? Number(category_id) : item.category_id,
      cost_price: cost_price ? Number(cost_price) : item.cost_price,
      sell_price: sell_price ? Number(sell_price) : item.sell_price,
      img_path: req.file ? `images/${req.file.filename}` : item.img_path, // Fixed folder mapping path
      specs: parsedSpecs
    });

    if (quantity !== undefined) {
      await Stock.upsert({
        item_id: Number(id),
        quantity: Number(quantity)
      });
    }

    res.status(200).json({ success: true, message: "Gadget updated successfully!" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 5. DELETE ITEM
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

module.exports = {
  getAllItems,
  getSingleItem,
  createItem,
  updateItem,
  deleteItem
};