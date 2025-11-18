import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TalentListPage from './pages/TalentListPage';
import TalentDetailPage from './pages/TalentDetailPage';
import TalentRegisterPage from './pages/TalentRegisterPage';
import TalentEditPage from './pages/TalentEditPage';
import MyPage from './pages/MyPage';
import ProfileEditPage from './pages/ProfileEditPage';
import NotificationPage from './pages/NotificationPage';
import api from './services/api';
import './App.css';

// Home Page
const HomePage = () => (
  <div className="home-container">
    <div className="hero">
      <div className="container">
        <h1>재능기부 매칭 플랫폼</h1>
        <p className="hero-subtitle">서로의 재능을 나누고 배우는 커뮤니티</p>
        <div className="hero-buttons">
          <Link to="/talents" className="btn btn-primary btn-large">
            재능 둘러보기
          </Link>
          <Link to="/talents/new" className="btn btn-secondary btn-large">
            재능 등록하기
          </Link>
        </div>
      </div>
    </div>
    <div className="container">
      <section className="features">
        <h2>플랫폼 소개</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>무료 재능 공유</h3>
            <p>나의 재능을 나누고 다른 사람의 재능을 무료로 배울 수 있습니다</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>커뮤니티 형성</h3>
            <p>서로 배우고 가르치며 함께 성장하는 커뮤니티를 만들어갑니다</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>사회 기여</h3>
            <p>재능 나눔을 통해 더 나은 사회를 만드는데 기여합니다</p>
          </div>
        </div>
      </section>
    </div>
  </div>
);

// Navigation component with auth
const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">재능기부</Link>
        <div className="nav-links">
          <Link to="/talents">재능 목록</Link>
          {isAuthenticated && (
            <>
              <Link to="/talents/new">재능 등록</Link>
              <Link to="/my-page">마이페이지</Link>
              <Link to="/notifications" className="notification-bell">
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </Link>
              <span className="user-name">{user?.name}님</span>
              <button onClick={handleLogout} className="btn-logout">로그아웃</button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function AppContent() {
  return (
    <div className="App">
      <Navigation />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/talents" element={<TalentListPage />} />
          <Route path="/talents/new" element={<TalentRegisterPage />} />
          <Route path="/talents/:id" element={<TalentDetailPage />} />
          <Route path="/talents/:id/edit" element={<TalentEditPage />} />
          <Route path="/my-page" element={<MyPage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 재능기부 매칭 플랫폼. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
