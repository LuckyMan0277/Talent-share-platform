import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import './TalentPages.css';

const CATEGORIES = [
  '전체',
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

const TalentListPage = () => {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('전체');

  useEffect(() => {
    loadTalents();
  }, [selectedCategory, locationFilter]);

  const loadTalents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (selectedCategory !== '전체') {
        params.category = selectedCategory;
      }
      if (locationFilter === '온라인') {
        params.isOnline = true;
      } else if (locationFilter === '오프라인') {
        params.isOnline = false;
      }

      const response = await api.get('/talents', { params });
      setTalents(response.data.data);
    } catch (err) {
      setError('재능 목록을 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTalentsWithSearch();
  };

  const loadTalentsWithSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const params = { search: searchQuery };
      if (selectedCategory !== '전체') {
        params.category = selectedCategory;
      }
      if (locationFilter === '온라인') {
        params.isOnline = true;
      } else if (locationFilter === '오프라인') {
        params.isOnline = false;
      }

      const response = await api.get('/talents', { params });
      setTalents(response.data.data);
    } catch (err) {
      setError('검색에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const filteredTalents = talents;

  return (
    <div className="talent-list-container">
      <div className="container">
        <div className="page-header">
          <h1>재능 목록</h1>
          <p>배우고 싶은 재능을 찾아보세요</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="재능 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            검색
          </button>
        </form>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>카테고리:</label>
            <div className="category-buttons">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>장소:</label>
            <div className="location-buttons">
              {['전체', '온라인', '오프라인'].map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  className={`location-btn ${locationFilter === loc ? 'active' : ''}`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <LoadingSpinner message="재능 목록을 불러오는 중..." />
        ) : (
          <>
            <div className="results-count">
              총 {filteredTalents.length}개의 재능
            </div>

            {filteredTalents.length === 0 ? (
              <div className="no-results">
                <p>검색 결과가 없습니다</p>
                <Link to="/talents/new" className="btn btn-primary">
                  재능 등록하기
                </Link>
              </div>
            ) : (
              <div className="talent-grid">
                {filteredTalents.map(talent => (
                  <Link
                    key={talent._id}
                    to={`/talents/${talent._id}`}
                    className="talent-card"
                  >
                    {talent.image && (
                      <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                        <img
                          src={`http://localhost:5000${talent.image}`}
                          alt={talent.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}

                    <div className="talent-card-header">
                      <span className="talent-category">{talent.category}</span>
                      <span className="talent-location">
                        {talent.isOnline ? '온라인' : '오프라인'}
                      </span>
                    </div>

                    <h3 className="talent-title">{talent.title}</h3>
                    <p className="talent-description">
                      {talent.description.length > 100
                        ? talent.description.substring(0, 100) + '...'
                        : talent.description}
                    </p>

                    <div className="talent-card-footer">
                      {!talent.isOnline && (
                        <span className="talent-info">
                          📍 {talent.location}
                        </span>
                      )}
                      <span className="talent-info">
                        👥 최대 {talent.maxParticipants}명
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TalentListPage;
