const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Talent = require('../models/Talent');
const asyncHandler = require('../utils/asyncHandler');
const createNotification = require('../utils/createNotification');

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  // Check if booking exists
  const booking = await Booking.findById(bookingId)
    .populate('talentId');

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: '예약을 찾을 수 없습니다'
    });
  }

  // Check if user is the booking owner
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '본인의 예약에만 리뷰를 작성할 수 있습니다'
    });
  }

  // Check if booking is completed
  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      error: '확정된 예약에만 리뷰를 작성할 수 있습니다'
    });
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    return res.status(400).json({
      success: false,
      error: '이미 리뷰를 작성했습니다'
    });
  }

  const talent = booking.talentId;

  // Create review
  const review = await Review.create({
    bookingId,
    talentId: talent._id,
    reviewerId: req.user.id,
    providerId: talent.userId,
    rating,
    comment
  });

  const populatedReview = await Review.findById(review._id)
    .populate('reviewerId', 'name profileImage')
    .populate('talentId', 'title')
    .populate('bookingId');

  // Create notification for talent provider
  try {
    await createNotification({
      userId: talent.userId,
      type: 'review_received',
      title: '새로운 리뷰',
      message: `"${talent.title}"에 대한 ${rating}점 리뷰를 받았습니다.`,
      relatedTalent: talent._id
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }

  res.status(201).json({
    success: true,
    data: populatedReview
  });
});

// @desc    Get reviews for a talent
// @route   GET /api/reviews/talent/:talentId
// @access  Public
exports.getTalentReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ talentId: req.params.talentId })
    .populate('reviewerId', 'name profileImage')
    .sort({ createdAt: -1 });

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  res.status(200).json({
    success: true,
    count: reviews.length,
    averageRating: averageRating.toFixed(1),
    data: reviews
  });
});

// @desc    Get reviews by a provider (user who provides talents)
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ providerId: req.params.providerId })
    .populate('reviewerId', 'name profileImage')
    .populate('talentId', 'title')
    .sort({ createdAt: -1 });

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  res.status(200).json({
    success: true,
    count: reviews.length,
    averageRating: averageRating.toFixed(1),
    data: reviews
  });
});

// @desc    Get reviews written by current user
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ reviewerId: req.user.id })
    .populate('talentId', 'title')
    .populate('providerId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      error: '리뷰를 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (review.reviewerId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '본인의 리뷰만 수정할 수 있습니다'
    });
  }

  const { rating, comment } = req.body;

  review = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, comment },
    {
      new: true,
      runValidators: true
    }
  ).populate('reviewerId', 'name profileImage')
   .populate('talentId', 'title');

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      error: '리뷰를 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (review.reviewerId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '본인의 리뷰만 삭제할 수 있습니다'
    });
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Check if user can review a booking
// @route   GET /api/reviews/can-review/:bookingId
// @access  Private
exports.canReview = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: '예약을 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      canReview: false,
      reason: '본인의 예약이 아닙니다'
    });
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({ bookingId: req.params.bookingId });
  if (existingReview) {
    return res.status(200).json({
      success: true,
      canReview: false,
      reason: '이미 리뷰를 작성했습니다',
      review: existingReview
    });
  }

  // Check booking status
  if (booking.status !== 'confirmed') {
    return res.status(200).json({
      success: true,
      canReview: false,
      reason: '확정된 예약만 리뷰 작성 가능합니다'
    });
  }

  res.status(200).json({
    success: true,
    canReview: true
  });
});
