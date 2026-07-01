const { Item, Stock, Brand, Category } = require('../models');
const fs = require('fs');
const path = require('path');
const DEFAULT_IMAGE = 'images/default-gadget.jpg';

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeImages(itemLike) {
  const fromImages = parseJsonArray(itemLike.images);
  if (fromImages.length > 0) return fromImages;

  if (itemLike.img_path && itemLike.img_path.trim() !== '') {
    return [itemLike.img_path];
  }

  return [DEFAULT_IMAGE];
}

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
      const plain = item.get({ plain: true });
      return {
        item_id: plain.item_id,
        description: plain.description,
        brand_id: plain.brand_id,
        category_id: plain.category_id,
        cost_price: plain.cost_price,
        sell_price: plain.sell_price,
        specs: plain.specs,
        // Fallbacks preserved for frontend safety
        img_path: plain.img_path || DEFAULT_IMAGE,
        images: plain.images || JSON.stringify([plain.img_path || DEFAULT_IMAGE]),
        quantity: plain.Stock?.quantity ?? 0,
        brand: plain.brandInfo?.name || 'Unknown',
        category: plain.categoryInfo?.name || 'Unknown'
      };
    });

    res.status(200).json({ success: true, rows: formattedRows });
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

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const plain = item.get({ plain: true });
    const payload = {
      item_id: plain.item_id,
      description: plain.description,
      brand_id: plain.brand_id,
      category_id: plain.category_id,
      cost_price: plain.cost_price,
      sell_price: plain.sell_price,
      specs: plain.specs,
      img_path: plain.img_path || DEFAULT_IMAGE,
      images: plain.images || JSON.stringify([plain.img_path || DEFAULT_IMAGE]),
      quantity: plain.Stock?.quantity ?? 0,
      brand: plain.brandInfo?.name || 'Unknown',
      category: plain.categoryInfo?.name || 'Unknown'
    };

    res.status(200).json({ success: true, data: payload });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 3. CREATE ITEM
const createItem = async (req, res) => {
  try {
    const { description, brand_id, category_id, cost_price, sell_price, quantity, specs } = req.body;

    let parsedSpecs = {};
    if (specs) {
      try {
        parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      } catch {
        parsedSpecs = {};
      }
    }

    // FIXED: Collect all items from multi-upload array (req.files) instead of req.file
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(file => file.path.replace(/\\/g, '/'));
    } else if (req.file) {
      uploadedImages = [req.file.path.replace(/\\/g, '/')];
    }

    // Fallback if no images are provided at all
    if (uploadedImages.length === 0) {
      uploadedImages.push(DEFAULT_IMAGE);
    }

    const newItem = await Item.create({
      description,
      brand_id: brand_id ? Number(brand_id) : null,
      category_id: category_id ? Number(category_id) : null,
      cost_price: cost_price ? Number(cost_price) : 0,
      sell_price: sell_price ? Number(sell_price) : 0,
      img_path: uploadedImages[0], // Keep primary image set here to prevent database constraints from breaking
      images: JSON.stringify(uploadedImages), // Correctly stringifies entire string array into images column
      specs: parsedSpecs
    });

    if (quantity !== undefined) {
      await Stock.create({
        item_id: newItem.item_id,
        quantity: Number(quantity)
      });
    }

    res.status(201).json({ success: true, message: 'Gadget created successfully!', data: newItem });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};


// 4. UPDATE ITEM
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, brand_id, category_id, cost_price, sell_price, quantity, specs, imagesToDelete } = req.body;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    let parsedSpecs = item.specs;
    if (specs) {
      try {
        parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      } catch {
        // preserve old values if parsing fails
      }
    }

    // Unpack old files array configuration
    let currentImages = parseJsonArray(item.images);
    if (currentImages.length === 0 && item.img_path) {
      currentImages = [item.img_path];
    }

    // --- NEW: Handle Individual Image Deletion Request ---
    if (imagesToDelete) {
      try {
        // Parse the list of image paths sent from the frontend client
        const toDeleteArray = typeof imagesToDelete === 'string' ? JSON.parse(imagesToDelete) : imagesToDelete;
        
        if (Array.isArray(toDeleteArray)) {
          toDeleteArray.forEach(imgRoute => {
            // Filter out from our tracking array configuration
            currentImages = currentImages.filter(img => img !== imgRoute);

            // Physically delete the file from the server disk storage
            if (imgRoute !== DEFAULT_IMAGE) {
              // Adjust pathing if your "images" folder is inside a "public" directory (e.g., '../public/' + imgRoute)
              const absoluteFilePath = path.join(__dirname, '..', imgRoute);
              fs.unlink(absoluteFilePath, (err) => {
                if (err) {
                  console.error(`Failed to delete physical file at ${absoluteFilePath}:`, err.message);
                }
              });
            }
          });
        }
      } catch (parseError) {
        console.error("Failed to parse imagesToDelete:", parseError.message);
      }
    }

    // Capture newly uploaded files from multi-upload array (req.files)
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(file => file.path.replace(/\\/g, '/'));
    } else if (req.file) {
      uploadedImages = [req.file.path.replace(/\\/g, '/')];
    }

    // Clean out fallback thumbnail placeholder if new images are replacing it
    if (uploadedImages.length > 0 && currentImages.length === 1 && currentImages[0] === DEFAULT_IMAGE) {
      currentImages = [];
    }

    // Combine what remains of the old gallery images with the newly added files
    const nextImages = [...currentImages, ...uploadedImages];

    // Fallback if no images are left at all
    if (nextImages.length === 0) {
      nextImages.push(DEFAULT_IMAGE);
    }

    await item.update({
      description: description || item.description,
      brand_id: brand_id ? Number(brand_id) : item.brand_id,
      category_id: category_id ? Number(category_id) : item.category_id,
      cost_price: cost_price ? Number(cost_price) : item.cost_price,
      sell_price: sell_price ? Number(sell_price) : item.sell_price,
      img_path: nextImages[0], // Synchronize master thumbnail pointer
      images: JSON.stringify(nextImages), // Save total updated JSON dataset configurations
      specs: parsedSpecs
    });

    if (quantity !== undefined) {
      await Stock.upsert({
        item_id: Number(id),
        quantity: Number(quantity)
      });
    }

    res.status(200).json({ success: true, message: 'Gadget updated successfully!' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 5. DELETE ITEM
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await Item.destroy({ where: { item_id: id } });

    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    res.status(200).json({ success: true, message: 'Item deleted successfully.' });
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