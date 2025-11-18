import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import './AuthPages.css';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name
      }));
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('이미지 크기는 5MB 이하여야 합니다');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password change if provided
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        const errorMsg = '현재 비밀번호를 입력해주세요';
        setError(errorMsg);
        showError(errorMsg);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        const errorMsg = '새 비밀번호가 일치하지 않습니다';
        setError(errorMsg);
        showError(errorMsg);
        return;
      }

      if (formData.newPassword.length < 6) {
        const errorMsg = '새 비밀번호는 최소 6자 이상이어야 합니다';
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);

      if (formData.currentPassword && formData.newPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      await api.put('/users/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showSuccess('프로필이 성공적으로 수정되었습니다!');

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Reload user data
      window.location.reload();
    } catch (err) {
      const errorMsg = err.response?.data?.error || '프로필 수정에 실패했습니다. 다시 시도해주세요.';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>프로필 수정</h1>
        <p className="auth-subtitle">회원 정보를 수정하세요</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>프로필 이미지</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {(imagePreview || user?.profileImage) && (
                <img
                  src={imagePreview || `http://localhost:5000${user?.profileImage}`}
                  alt="Profile preview"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e1e8ed'
                  }}
                />
              )}
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                style={{ flex: 1 }}
              />
            </div>
            <small style={{ color: '#657786', display: 'block', marginTop: '0.5rem' }}>
              JPG, PNG, GIF 파일 (최대 5MB)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일 (변경 불가)</label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
            />
          </div>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e1e8ed' }} />

          <h3 style={{ marginBottom: '1rem' }}>비밀번호 변경 (선택사항)</h3>

          <div className="form-group">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="현재 비밀번호"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="최소 6자 이상"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
            {loading ? (
              <LoadingSpinner size="small" message="" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/my-page')}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  수정하기
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;
