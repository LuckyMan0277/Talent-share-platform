import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import './TalentPages.css';

const CATEGORIES = [
  '프로그래밍',
  '디자인',
  '언어',
  '음악',
  '운동',
  '요리',
  '사진/영상',
  '마케팅',
  '글쓰기',
  '기타'
];

const TalentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    isOnline: false,
    maxParticipants: 1,
    contact: ''
  });

  const [talentImage, setTalentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadTalent();
  }, [isAuthenticated, id]);

  const loadTalent = async () => {
    try {
      const response = await api.get(`/talents/${id}`);
      const talent = response.data.data;

      // Check if user is owner
      if (talent.userId._id !== user.id) {
        showError('본인의 재능만 수정할 수 있습니다');
        navigate(`/talents/${id}`);
        return;
      }

      setFormData({
        title: talent.title,
        description: talent.description,
        category: talent.category,
        location: talent.location,
        isOnline: talent.isOnline,
        maxParticipants: talent.maxParticipants,
        contact: talent.contact || ''
      });

      if (talent.image) {
        setCurrentImage(talent.image);
      }
    } catch (err) {
      const errorMsg = '재능 정보를 불러오는데 실패했습니다';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('이미지 크기는 5MB 이하여야 합니다');
        return;
      }
      setTalentImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (talentImage) {
        formDataToSend.append('talentImage', talentImage);
      }

      await api.put(`/talents/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showSuccess('재능이 성공적으로 수정되었습니다!');
      navigate(`/talents/${id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || '재능 수정에 실패했습니다. 다시 시도해주세요.';
      setError(errorMsg);
      showError(errorMsg);
      setSubmitLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner message="재능 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="talent-form-container">
      <div className="container">
        <div className="talent-form-card">
          <h1>재능 수정</h1>
          <p className="form-subtitle">재능 정보를 수정하세요</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="talent-form">
            <div className="form-group">
              <label htmlFor="title">재능 제목 *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="예: 파이썬 기초 프로그래밍"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">상세 설명 *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="재능에 대한 자세한 설명을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label htmlFor="talentImage">대표 이미지</label>
              {(imagePreview || currentImage) && (
                <div style={{ marginBottom: '1rem' }}>
                  <img
                    src={imagePreview || `http://localhost:5000${currentImage}`}
                    alt="Talent"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              <input
                type="file"
                id="talentImage"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small style={{ color: '#657786', display: 'block', marginTop: '0.5rem' }}>
                JPG, PNG, GIF 파일 (최대 5MB)
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">카테고리 *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">카테고리 선택</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maxParticipants">최대 참가 인원 *</label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isOnline"
                  checked={formData.isOnline}
                  onChange={handleChange}
                />
                <span className="checkbox-label">온라인으로 진행</span>
              </label>
            </div>

            {!formData.isOnline && (
              <div className="form-group">
                <label htmlFor="location">장소 *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required={!formData.isOnline}
                  placeholder="예: 서울시 강남구 역삼동"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="contact">연락처 *</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="예: 010-1234-5678, 카카오톡ID, 이메일 등"
              />
              <small style={{ color: '#657786', display: 'block', marginTop: '0.5rem' }}>
                수업 신청자에게만 공개됩니다
              </small>
            </div>

            <div className="form-info">
              * 일정은 상세 페이지에서 개별적으로 추가/삭제할 수 있습니다.
            </div>

            <div className="form-actions">
              {submitLoading ? (
                <LoadingSpinner size="small" message="" />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(`/talents/${id}`)}
                    className="btn btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary">
                    수정하기
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TalentEditPage;
