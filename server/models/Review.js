const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  talentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Talent',
    required: true,
    index: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: [true, '평점을 입력해주세요'],
    min: [1, '평점은 최소 1점입니다'],
    max: [5, '평점은 최대 5점입니다']
  },
  comment: {
    type: String,
    required: [true, '리뷰 내용을 입력해주세요'],
    maxlength: [500, '리뷰는 500자를 초과할 수 없습니다']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying reviews by talent or provider
ReviewSchema.index({ talentId: 1, createdAt: -1 });
ReviewSchema.index({ providerId: 1, createdAt: -1 });

// Prevent duplicate reviews for the same booking
ReviewSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
