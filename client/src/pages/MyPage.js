import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewForm from '../components/ReviewForm';
import api from '../services/api';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('myTalents');

  const [myTalents, setMyTalents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [talentsRes, bookingsRes, receivedRes] = await Promise.all([
        api.get('/users/my-talents'),
        api.get('/users/my-bookings'),
        api.get('/users/received-bookings')
      ]);

      setMyTalents(talentsRes.data.data);
      setMyBookings(bookingsRes.data.data);
      setReceivedBookings(receivedRes.data.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('신청을 취소하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}`);
      showSuccess('신청이 취소되었습니다');
      loadData();
    } catch (err) {
      showError('취소에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleReviewClick = (booking) => {
    setSelectedBooking(booking);
    setShowReviewForm(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setSelectedBooking(null);
    loadData();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner message="내 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="container">
        <div className="mypage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user?.profileImage && (
              <img
                src={`http://localhost:5000${user.profileImage}`}
                alt="Profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #1DA1F2'
                }}
              />
            )}
            <div>
              <h1>{user?.name}님의 페이지</h1>
              <p>{user?.email}</p>
            </div>
          </div>
          <Link to="/profile/edit" className="btn btn-primary">
            프로필 수정
          </Link>
        </div>

        <div className="tabs">
          <button
            onClick={() => setActiveTab('myTalents')}
            className={`tab ${activeTab === 'myTalents' ? 'active' : ''}`}
          >
            내가 등록한 재능 ({myTalents.length})
          </button>
          <button
            onClick={() => setActiveTab('myBookings')}
            className={`tab ${activeTab === 'myBookings' ? 'active' : ''}`}
          >
            내가 신청한 수업 ({myBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('receivedBookings')}
            className={`tab ${activeTab === 'receivedBookings' ? 'active' : ''}`}
          >
            받은 신청 ({receivedBookings.length})
          </button>
        </div>

        <div className="tab-content">
          {/* My Talents */}
          {activeTab === 'myTalents' && (
            <div className="talent-section">
              {myTalents.length === 0 ? (
                <div className="empty-state">
                  <p>등록한 재능이 없습니다</p>
                  <Link to="/talents/new" className="btn btn-primary">
                    재능 등록하기
                  </Link>
                </div>
              ) : (
                <div className="items-list">
                  {myTalents.map(talent => (
                    <div key={talent._id} className="item-card">
                      <div className="item-header">
                        <h3>{talent.title}</h3>
                        <span className="badge">{talent.category}</span>
                      </div>
                      <p className="item-description">{talent.description}</p>
                      <div className="item-footer">
                        <span>
                          {talent.isOnline ? '온라인' : talent.location}
                        </span>
                        <Link
                          to={`/talents/${talent._id}`}
                          className="btn btn-small btn-primary"
                        >
                          상세보기
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Bookings */}
          {activeTab === 'myBookings' && (
            <div className="booking-section">
              {myBookings.length === 0 ? (
                <div className="empty-state">
                  <p>신청한 수업이 없습니다</p>
                  <Link to="/talents" className="btn btn-primary">
                    재능 둘러보기
                  </Link>
                </div>
              ) : (
                <div className="items-list">
                  {myBookings.map(booking => (
                    <div key={booking._id} className="item-card">
                      <div className="item-header">
                        <h3>{booking.talentId?.title}</h3>
                        <span
                          className={`badge ${
                            booking.status === 'confirmed'
                              ? 'badge-success'
                              : 'badge-cancelled'
                          }`}
                        >
                          {booking.status === 'confirmed' ? '확정' : '취소됨'}
                        </span>
                      </div>
                      <p className="item-info">
                        제공자: {booking.talentId?.userId?.name}
                      </p>
                      {booking.scheduleId && (
                        <p className="item-info">
                          일정: {new Date(booking.scheduleId.date).toLocaleDateString('ko-KR')}{' '}
                          {booking.scheduleId.startTime} - {booking.scheduleId.endTime}
                        </p>
                      )}
                      <div className="item-footer">
                        <span className="item-date">
                          신청일: {new Date(booking.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {booking.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleReviewClick(booking)}
                                className="btn btn-small btn-primary"
                              >
                                리뷰 작성
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="btn btn-small"
                                style={{ background: '#dc3545', color: 'white' }}
                              >
                                신청 취소
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Received Bookings */}
          {activeTab === 'receivedBookings' && (
            <div className="booking-section">
              {receivedBookings.length === 0 ? (
                <div className="empty-state">
                  <p>받은 신청이 없습니다</p>
                </div>
              ) : (
                <div className="items-list">
                  {receivedBookings.map(booking => (
                    <div key={booking._id} className="item-card">
                      <div className="item-header">
                        <h3>{booking.talentId?.title}</h3>
                        <span
                          className={`badge ${
                            booking.status === 'confirmed'
                              ? 'badge-success'
                              : 'badge-cancelled'
                          }`}
                        >
                          {booking.status === 'confirmed' ? '확정' : '취소됨'}
                        </span>
                      </div>
                      <p className="item-info">
                        신청자: {booking.userId?.name} ({booking.userId?.email})
                      </p>
                      {booking.scheduleId && (
                        <p className="item-info">
                          일정: {new Date(booking.scheduleId.date).toLocaleDateString('ko-KR')}{' '}
                          {booking.scheduleId.startTime} - {booking.scheduleId.endTime}
                        </p>
                      )}
                      <div className="item-footer">
                        <span className="item-date">
                          신청일: {new Date(booking.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Form Modal */}
        {showReviewForm && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <ReviewForm
                bookingId={selectedBooking._id}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
