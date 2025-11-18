import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './AuthPages.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = '비밀번호가 일치하지 않습니다';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      const errorMsg = '비밀번호는 최소 6자 이상이어야 합니다';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);

    const result = await signup(formData.name, formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      showSuccess('회원가입에 성공했습니다! 환영합니다!');
      navigate('/');
    } else {
      const errorMsg = result.error || '회원가입에 실패했습니다. 다시 시도해주세요.';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>회원가입</h1>
        <p className="auth-subtitle">재능을 나누고 배우는 커뮤니티에 참여하세요</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="최소 6자 이상"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력하세요"
              minLength="6"
            />
          </div>

          {loading ? (
            <LoadingSpinner size="small" message="" />
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-block"
            >
              가입하기
            </button>
          )}
        </form>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
