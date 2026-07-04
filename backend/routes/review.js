const express = require('express');
const router = express.Router();

const {
  getReviewsForItem,
  checkReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
  getMyReviewForItem,
  adminGetAllReviews,
  adminDeleteReview
} = require('../controllers/review');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public
router.get('/items/:itemId/reviews', getReviewsForItem);

// Authenticated customer
router.get('/items/:itemId/reviews/eligibility', isAuthenticatedUser, checkReviewEligibility);
router.get('/items/:itemId/reviews/mine', isAuthenticatedUser, getMyReviewForItem);
router.post('/items/:itemId/reviews', isAuthenticatedUser, createReview);
router.put('/reviews/:reviewId', isAuthenticatedUser, updateReview);
router.delete('/reviews/:reviewId', isAuthenticatedUser, deleteReview);

// Admin
router.get('/admin/reviews', isAuthenticatedUser, authorizeRoles('admin'), adminGetAllReviews);
router.delete('/admin/reviews/:reviewId', isAuthenticatedUser, authorizeRoles('admin'), adminDeleteReview);

module.exports = router;