import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewList from '../components/ReviewList';
import api from '../services/api';
import './TalentPages.css';

const TalentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [talent, setTalent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadTalent();
    loadSchedules();
    loadReviews();
  }, [id]);

  const loadTalent = async () => {
    try {
      const response = await api.get(`/talents/${id}`);
      setTalent(response.data.data);
    } catch (err) {
      const errorMsg = '재능 정보를 불러오는데 실패했습니다';
      setError(errorMsg);
      showError(errorMsg);
      console.error(err);
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await api.get(`/talents/${id}/schedules`);
      setSchedules(response.data.data);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/talent/${id}`);
      setReviews(response.data.data);
      setAverageRating(parseFloat(response.data.averageRating));
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleBooking = async (scheduleId) => {
    if (!isAuthenticated) {
      showInfo('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        talentId: id,
        scheduleId
      });

      showSuccess('수업 신청이 완료되었습니다!');
      loadSchedules(); // Reload to update participant counts
    } catch (err) {
      const errorMessage = err.response?.data?.error || '신청에 실패했습니다. 다시 시도해주세요.';
      showError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/talents/${id}`);
      showSuccess('재능이 삭제되었습니다');
      navigate('/talents');
    } catch (err) {
      showError('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner message="재능 정보를 불러오는 중..." />
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="container">
        <div className="error-message">{error || '재능을 찾을 수 없습니다'}</div>
        <Link to="/talents" className="btn btn-primary">목록으로 돌아가기</Link>
      </div>
    );
  }

  const isOwner = user && talent.userId._id === user.id;

  return (
    <div className="talent-detail-container">
      <div className="container">
        <div className="talent-detail-card">
          <div className="talent-detail-header">
            <div className="talent-meta">
              <span className="talent-badge">{talent.category}</span>
              <span className="talent-badge">
                {talent.isOnline ? '온라인' : '오프라인'}
              </span>
            </div>
            <h1>{talent.title}</h1>
            <p className="talent-host">
              제공자: {talent.userId.name} ({talent.userId.email})
            </p>
          </div>

          {talent.image && (
            <div style={{ marginBottom: '2rem' }}>
              <img
                src={`http://localhost:5000${talent.image}`}
                alt={talent.title}
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          <div className="talent-detail-body">
            <section className="detail-section">
              <h2>상세 설명</h2>
              <p>{talent.description}</p>
            </section>

            <section className="detail-section">
              <h2>수업 정보</h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">장소</div>
                  <div className="info-value">
                    {talent.isOnline ? '온라인' : talent.location}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">최대 인원</div>
                  <div className="info-value">{talent.maxParticipants}명</div>
                </div>
                <div className="info-item">
                  <div className="info-label">카테고리</div>
                  <div className="info-value">{talent.category}</div>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <h2>가능한 일정</h2>
              {schedules.length === 0 ? (
                <p>등록된 일정이 없습니다</p>
              ) : (
                <div className="schedules-list">
                  {schedules.map(schedule => {
                    const isFull = schedule.currentParticipants >= talent.maxParticipants;
                    const scheduleDate = new Date(schedule.date);
                    const isPast = scheduleDate < new Date();

                    return (
                      <div key={schedule._id} className="schedule-card">
                        <div className="schedule-info">
                          <div className="schedule-date">
                            {new Date(schedule.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                          <div className="schedule-time">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="schedule-capacity">
                            참가 인원: {schedule.currentParticipants} / {talent.maxParticipants}
                          </div>
                        </div>

                        {!isOwner && (
                          <button
                            onClick={() => handleBooking(schedule._id)}
                            disabled={isFull || isPast || bookingLoading}
                            className={`btn ${isFull || isPast ? 'btn-secondary' : 'btn-primary'}`}
                          >
                            {isPast ? '지난 일정' : isFull ? '마감' : '신청하기'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <ReviewList reviews={reviews} averageRating={averageRating} />

            <div className="detail-actions">
              <Link to="/talents" className="btn btn-secondary">
                목록으로
              </Link>

              {isOwner && (
                <>
                  <Link
                    to={`/talents/${id}/edit`}
                    className="btn btn-primary"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="btn"
                    style={{ background: '#dc3545', color: 'white' }}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDetailPage;
