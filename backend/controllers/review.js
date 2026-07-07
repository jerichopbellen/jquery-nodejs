const { Review, Order, OrderItem, Item, User, sequelize } = require('../models');

// Helper: check if this user has a delivered order containing this item
async function hasDeliveredPurchase(userId, itemId) {
  const count = await OrderItem.count({
    where: { item_id: itemId },
    include: [
      {
        model: Order,
        as: 'order',
        where: { user_id: userId, status: 'delivered' },
        attributes: []
      }
    ]
  });
  return count > 0;
}

function formatReview(review) {
  return {
    reviewId: review.review_id,
    itemId: review.item_id,
    userId: review.user_id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    reviewerName: (review.user?.first_name || '') + ' ' + (review.user?.last_name || '') || 'Anonymous'
  };
}

// ── Public / Customer ────────────────────────────────────────────────

// GET /api/v1/items/:itemId/reviews  (public — anyone browsing can see reviews)
exports.getReviewsForItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const reviews = await Review.findAll({
      where: { item_id: itemId },
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      averageRating,
      totalReviews,
      reviews: reviews.map(formatReview)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/items/:itemId/reviews/eligibility  (auth required — can this user review?)
exports.checkReviewEligibility = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { itemId } = req.params;

    const alreadyReviewed = await Review.findOne({
      where: { user_id: userId, item_id: itemId }
    });

    if (alreadyReviewed) {
      return res.status(200).json({
        success: true,
        canReview: false,
        alreadyReviewed: true,
        existingReview: formatReview(alreadyReviewed)
      });
    }

    const eligible = await hasDeliveredPurchase(userId, itemId);

    return res.status(200).json({
      success: true,
      canReview: eligible,
      alreadyReviewed: false
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/items/:itemId/reviews  (auth required)
exports.createReview = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { itemId } = req.params;
    const { rating, comment } = req.body;

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const existing = await Review.findOne({ where: { user_id: userId, item_id: itemId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this item' });
    }

    const eligible = await hasDeliveredPurchase(userId, itemId);
    if (!eligible) {
      return res.status(403).json({
        success: false,
        message: 'You can only review items from delivered orders'
      });
    }

    const review = await Review.create({
      item_id: itemId,
      user_id: userId,
      rating: ratingNum,
      comment: comment || null
    });

    const withUser = await Review.findByPk(review.review_id, {
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: formatReview(withUser)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/reviews/:reviewId  (owner only)
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own review' });
    }

    const updateFields = {};
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      }
      updateFields.rating = ratingNum;
    }
    if (comment !== undefined) {
      updateFields.comment = comment;
    }

    await review.update(updateFields);

    const withUser = await Review.findByPk(review.review_id, {
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
    });

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: formatReview(withUser)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/reviews/:reviewId  (owner only)
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own review' });
    }

    await review.destroy();

    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/items/:itemId/reviews/mine (auth required — get my review for edit prefill)
exports.getMyReviewForItem = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { itemId } = req.params;

    const review = await Review.findOne({
      where: { user_id: userId, item_id: itemId },
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'No review found' });
    }

    return res.status(200).json({ success: true, review: formatReview(review) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin ────────────────────────────────────────────────────────────

// GET /api/v1/admin/reviews  (admin only — optionally ?itemId=)
exports.adminGetAllReviews = async (req, res) => {
  try {
    const { itemId } = req.query;
    const where = itemId ? { item_id: itemId } : {};

    const reviews = await Review.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
        { model: Item, as: 'item', attributes: ['item_id', 'description'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      rows: reviews.map((r) => ({
        reviewId: r.review_id,
        itemId: r.item_id,
        itemName: r.item?.description || 'Item',
        userId: r.user_id,
        reviewerName: `${r.user?.first_name || ''} ${r.user?.last_name || ''}` || 'Unknown',
        reviewerEmail: r.user?.email || '',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/admin/reviews/:reviewId  (admin only — moderation)
exports.adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await review.destroy();

    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};