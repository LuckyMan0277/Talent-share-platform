import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const TalentRegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
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

  const [schedules, setSchedules] = useState([
    { date: '', startTime: '', endTime: '' }
  ]);

  const [talentImage, setTalentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { date: '', startTime: '', endTime: '' }]);
  };

  const removeSchedule = (index) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
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

    // Validate schedules
    const validSchedules = schedules.filter(
      s => s.date && s.startTime && s.endTime
    );

    if (validSchedules.length === 0) {
      const errorMsg = '최소 1개 이상의 일정을 추가해주세요';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append('schedules', JSON.stringify(validSchedules));

      if (talentImage) {
        formDataToSend.append('talentImage', talentImage);
      }

      const response = await api.post('/talents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showSuccess('재능이 성공적으로 등록되었습니다!');
      navigate(`/talents/${response.data.data._id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || '재능 등록에 실패했습니다. 다시 시도해주세요.';
      setError(errorMsg);
      showError(errorMsg);
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="talent-form-container">
      <div className="container">
        <div className="talent-form-card">
          <h1>재능 등록</h1>
          <p className="subtitle">나의 재능을 나누고 다른 사람들과 함께 성장하세요</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="talent-form">
            {/* Basic Information */}
            <section className="form-section">
              <h2>기본 정보</h2>

              <div className="form-group">
                <label htmlFor="title">재능 제목 *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="예: 초보자를 위한 Python 프로그래밍"
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
                  placeholder="재능에 대해 자세히 설명해주세요. 어떤 내용을 가르칠 수 있나요?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">카테고리 *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">카테고리를 선택하세요</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="talentImage">대표 이미지</label>
                {imagePreview && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img
                      src={imagePreview}
                      alt="Talent preview"
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
            </section>

            {/* Location Information */}
            <section className="form-section">
              <h2>장소 정보</h2>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isOnline"
                    checked={formData.isOnline}
                    onChange={handleChange}
                  />
                  온라인 수업
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
                    placeholder="예: 서울시 강남구 역삼동 카페"
                  />
                </div>
              )}
            </section>

            {/* Participants */}
            <section className="form-section">
              <h2>참가 인원 및 연락처</h2>

              <div className="form-group">
                <label htmlFor="maxParticipants">최대 인원 *</label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                  min="1"
                  max="50"
                />
              </div>

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
            </section>

            {/* Schedules */}
            <section className="form-section">
              <h2>일정 *</h2>
              <p style={{ color: '#657786', marginBottom: '1rem', fontSize: '0.9rem' }}>
                최소 1개 이상의 일정을 추가해주세요
              </p>

              {schedules.map((schedule, index) => (
                <div key={index} className="schedule-item">
                  <div className="schedule-header">
                    <h3>일정 {index + 1}</h3>
                    {schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="btn-remove"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="schedule-fields">
                    <div className="form-group">
                      <label>날짜</label>
                      <input
                        type="date"
                        value={schedule.date}
                        onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label>시작 시간</label>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>종료 시간</label>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSchedule}
                className="btn btn-secondary"
              >
                + 일정 추가
              </button>
            </section>

            {/* Submit */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '등록 중...' : '재능 등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TalentRegisterPage;
