import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import './TalentPages.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword.trim()) {
      showError('현재 비밀번호를 입력해주세요');
      return;
    }
    if (!formData.newPassword.trim()) {
      showError('새 비밀번호를 입력해주세요');
      return;
    }
    if (formData.newPassword.length < 6) {
      showError('새 비밀번호는 6자 이상이어야 합니다');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showError('새 비밀번호가 일치하지 않습니다');
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      showError('새 비밀번호는 현재 비밀번호와 달라야 합니다');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      showSuccess('비밀번호가 성공적으로 변경되었습니다');
      navigate('/mypage');
    } catch (err) {
      const errorMsg = err.response?.data?.error || '비밀번호 변경에 실패했습니다';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <LoadingSpinner message="비밀번호 변경 중..." />;
  }

  return (
    <div className="talent-form-container">
      <div className="container">
        <div className="talent-form-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h1>비밀번호 변경</h1>
          <p className="subtitle">새로운 비밀번호로 변경하세요</p>

          <form onSubmit={handleSubmit} className="talent-form">
            <section className="form-section">
              <div className="form-group">
                <label htmlFor="currentPassword">현재 비밀번호 *</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">새 비밀번호 *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">새 비밀번호 확인 *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
            </section>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/mypage')}
                className="btn btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
