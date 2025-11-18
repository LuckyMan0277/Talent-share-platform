import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import './NotificationPage.css';

const NotificationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadNotifications();
  }, [isAuthenticated, navigate, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? { unreadOnly: true } : {};
      const response = await api.get('/notifications', { params });
      setNotifications(response.data.data);
    } catch (err) {
      showError('알림을 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch (err) {
      showError('알림을 읽음으로 표시하는데 실패했습니다');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      showSuccess('모든 알림을 읽음으로 표시했습니다');
      loadNotifications();
    } catch (err) {
      showError('알림을 읽음으로 표시하는데 실패했습니다');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('이 알림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/notifications/${id}`);
      showSuccess('알림이 삭제되었습니다');
      loadNotifications();
    } catch (err) {
      showError('알림 삭제에 실패했습니다');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_created':
        return '📅';
      case 'booking_cancelled':
        return '❌';
      case 'talent_deleted':
        return '🗑️';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner message="알림을 불러오는 중..." />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-container">
      <div className="container">
        <div className="notification-header">
          <h1>알림</h1>
          <div className="notification-actions">
            <button
              onClick={() => setFilter('all')}
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            >
              읽지 않음 ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
                모두 읽음 표시
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>{filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <div className="notification-actions-btns">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="btn-icon"
                      title="읽음으로 표시"
                    >
                      ✓
                    </button>
                  )}
                  {notification.relatedTalent && (
                    <Link
                      to={`/talents/${notification.relatedTalent._id || notification.relatedTalent}`}
                      className="btn-icon"
                      title="재능 보기"
                    >
                      →
                    </Link>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="btn-icon btn-delete"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
