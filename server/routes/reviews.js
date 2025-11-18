const express = require('express');
const router = express.Router();
const {
  createReview,
  getTalentReviews,
  getProviderReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  canReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/talent/:talentId', getTalentReviews);
router.get('/provider/:providerId', getProviderReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.get('/can-review/:bookingId', protect, canReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
