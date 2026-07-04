const { Item, Stock, Brand, Category, Review, sequelize } = require('../models');
const { Op } = require('sequelize');
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

function formatItem(item, ratingData) {
  const plain = item.get({ plain: true });
  const rating = ratingData || { averageRating: 0, totalReviews: 0 };

  return {
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
    category: plain.categoryInfo?.name || 'Unknown',
    averageRating: rating.averageRating,
    totalReviews: rating.totalReviews
  };
}

// Bulk-fetch average rating + review count for a list of item IDs in ONE query,
// instead of querying per item (which would be slow for a grid of 12-48 items).
async function getRatingsMap(itemIds) {
  if (!itemIds || itemIds.length === 0) return {};

  const results = await Review.findAll({
    where: { item_id: itemIds },
    attributes: [
      'item_id',
      [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      [sequelize.fn('COUNT', sequelize.col('review_id')), 'totalReviews']
    ],
    group: ['item_id'],
    raw: true
  });

  const map = {};
  results.forEach((r) => {
    map[r.item_id] = {
      averageRating: Number(Number(r.averageRating).toFixed(1)),
      totalReviews: Number(r.totalReviews)
    };
  });
  return map;
}

// 1. GET ALL ITEMS (With Normalized Eager Loading)
const getAllItems = async (req, res) => {
  try {
    const includeOptions = [
      { model: Stock, as: 'Stock', attributes: ['quantity'] },
      { model: Brand, as: 'brandInfo', attributes: ['name'] },
      { model: Category, as: 'categoryInfo', attributes: ['name'] }
    ];

    const { page, limit, search, brand_id } = req.query;

    const whereOptions = {};
    if (search && search.trim() !== '') {
      whereOptions.description = { [Op.like]: `%${search.trim()}%` };
    }
    if (brand_id) {
      whereOptions.brand_id = Number(brand_id);
    }

    // --- Paginated path (used by home.js infinite scroll / search) ---
    if (page) {
      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
      const offset = (pageNum - 1) * limitNum;

      const { count, rows } = await Item.findAndCountAll({
        where: whereOptions,
        include: includeOptions,
        limit: limitNum,
        offset,
        order: [['item_id', 'DESC']],
        distinct: true
      });

      const ratingsMap = await getRatingsMap(rows.map((r) => r.item_id));
      const formattedRows = rows.map((item) => formatItem(item, ratingsMap[item.item_id]));
      const hasMore = offset + formattedRows.length < count;

      return res.status(200).json({
        success: true,
        rows: formattedRows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: count,
          totalPages: Math.ceil(count / limitNum),
          hasMore
        }
      });
    }

    // --- Original, unpaginated path (used by admin-items.html DataTable) ---
    const items = await Item.findAll({ where: whereOptions, include: includeOptions });
    const ratingsMap = await getRatingsMap(items.map((r) => r.item_id));
    const formattedRows = items.map((item) => formatItem(item, ratingsMap[item.item_id]));

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

    const ratingsMap = await getRatingsMap([item.item_id]);
    const payload = formatItem(item, ratingsMap[item.item_id]);

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

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(file => file.path.replace(/\\/g, '/'));
    } else if (req.file) {
      uploadedImages = [req.file.path.replace(/\\/g, '/')];
    }

    if (uploadedImages.length === 0) {
      uploadedImages.push(DEFAULT_IMAGE);
    }

    const newItem = await Item.create({
      description,
      brand_id: brand_id ? Number(brand_id) : null,
      category_id: category_id ? Number(category_id) : null,
      cost_price: cost_price ? Number(cost_price) : 0,
      sell_price: sell_price ? Number(sell_price) : 0,
      img_path: uploadedImages[0],
      images: JSON.stringify(uploadedImages),
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

    let currentImages = parseJsonArray(item.images);
    if (currentImages.length === 0 && item.img_path) {
      currentImages = [item.img_path];
    }

    if (imagesToDelete) {
      try {
        const toDeleteArray = typeof imagesToDelete === 'string' ? JSON.parse(imagesToDelete) : imagesToDelete;

        if (Array.isArray(toDeleteArray)) {
          toDeleteArray.forEach(imgRoute => {
            currentImages = currentImages.filter(img => img !== imgRoute);

            if (imgRoute !== DEFAULT_IMAGE) {
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

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(file => file.path.replace(/\\/g, '/'));
    } else if (req.file) {
      uploadedImages = [req.file.path.replace(/\\/g, '/')];
    }

    if (uploadedImages.length > 0 && currentImages.length === 1 && currentImages[0] === DEFAULT_IMAGE) {
      currentImages = [];
    }

    const nextImages = [...currentImages, ...uploadedImages];

    if (nextImages.length === 0) {
      nextImages.push(DEFAULT_IMAGE);
    }

    await item.update({
      description: description || item.description,
      brand_id: brand_id ? Number(brand_id) : item.brand_id,
      category_id: category_id ? Number(category_id) : item.category_id,
      cost_price: cost_price ? Number(cost_price) : item.cost_price,
      sell_price: sell_price ? Number(sell_price) : item.sell_price,
      img_path: nextImages[0],
      images: JSON.stringify(nextImages),
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