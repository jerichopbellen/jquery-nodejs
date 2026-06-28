const express = require('express');
const router = express.Router();
const upload = require('../utils/multer'); // Make sure this path is accurate to your utils folder

// Destructure cleanly from your updated controller file
const { 
  getAllItems,
  getSingleItem,
  createItem,
  updateItem,
  deleteItem 
} = require('../controllers/item'); // Verify this path points directly to controllers/item.js

const { isAuthenticatedUser } = require('../middlewares/auth');

router.get('/items', getAllItems);
router.get('/items/:id', getSingleItem);
router.post('/items', isAuthenticatedUser, upload.single('image'), createItem);
router.put('/items/:id', isAuthenticatedUser, upload.single('image'), updateItem);
router.delete('/items/:id', isAuthenticatedUser, deleteItem);

module.exports = router;