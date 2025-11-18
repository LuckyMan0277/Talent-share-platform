import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import './ReviewForm.css';

const ReviewForm = ({ bookingId, onReviewSubmitted, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      showError('리뷰 내용을 입력해주세요');
      return;
    }

    setLoading(true);

    try {
      await api.post('/reviews', {
        bookingId,
        rating,
        comment: comment.trim()
      });

      showSuccess('리뷰가 성공적으로 등록되었습니다!');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || '리뷰 등록에 실패했습니다';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="review-form-container">
      <h3>수업 리뷰 작성</h3>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-section">
          <label>평점</label>
          <div className="stars-container">
            {renderStars()}
            <span className="rating-text">{rating}점</span>
          </div>
        </div>

        <div className="comment-section">
          <label htmlFor="comment">리뷰 내용</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="수업에 대한 솔직한 후기를 남겨주세요 (최대 500자)"
            maxLength="500"
            rows="5"
            required
          />
          <small>{comment.length}/500</small>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              취소
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '등록 중...' : '리뷰 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
