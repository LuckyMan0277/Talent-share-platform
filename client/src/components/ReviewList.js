import React from 'react';
import './ReviewList.css';

const ReviewList = ({ reviews, averageRating }) => {
  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`review-star ${star <= rating ? 'filled' : ''}`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-list-container">
        <h3>리뷰</h3>
        <div className="no-reviews">
          <p>아직 리뷰가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-list-container">
      <div className="review-header">
        <h3>리뷰 ({reviews.length})</h3>
        <div className="average-rating">
          <div className="stars">{renderStars(Math.round(averageRating))}</div>
          <span className="rating-number">{averageRating} / 5.0</span>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-item">
            <div className="review-item-header">
              <div className="reviewer-info">
                {review.reviewerId?.profileImage && (
                  <img
                    src={`http://localhost:5000${review.reviewerId.profileImage}`}
                    alt={review.reviewerId.name}
                    className="reviewer-avatar"
                  />
                )}
                <div>
                  <div className="reviewer-name">{review.reviewerId?.name || '익명'}</div>
                  <div className="review-date">{formatDate(review.createdAt)}</div>
                </div>
              </div>
              <div className="review-rating">
                {renderStars(review.rating)}
                <span className="rating-number">{review.rating}</span>
              </div>
            </div>
            <div className="review-comment">
              {review.comment}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
