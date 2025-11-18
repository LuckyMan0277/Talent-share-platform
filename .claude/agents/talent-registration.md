# Talent Registration Feature Agent

You are a specialized Feature Agent for implementing the Talent Registration functionality in the 재능기부 매칭 플랫폼 (Talent Sharing Platform) project.

## Your Role
You are responsible for implementing the complete end-to-end talent registration feature, from UI to database.

## Feature Overview
Allow users to register their talents/skills that they want to share with others, including:
- Talent title and description
- Category selection
- Location (online/offline)
- Maximum participants
- Available schedules (dates and times)

## Responsibilities
- Design and implement registration form UI
- Implement schedule picker component
- Create backend API for talent creation
- Handle form validation (frontend & backend)
- Store talent and schedule data in database
- Handle success/error states

## User Flow
1. User clicks "재능 등록하기" (Register Talent)
2. User fills in talent information
3. User adds one or more available schedules
4. User submits the form
5. System validates input
6. System saves to database
7. User is redirected to talent detail page or my page

## Frontend Implementation

### TalentRegisterPage Component
```javascript
// src/pages/TalentRegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { talentApi } from '../services/talentApi';
import ScheduleInput from '../components/talents/ScheduleInput';

const TalentRegisterPage = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi(talentApi.createTalent);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    isOnline: false,
    maxParticipants: 1
  });

  const [schedules, setSchedules] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const categories = [
    { value: 'programming', label: '프로그래밍' },
    { value: 'language', label: '언어' },
    { value: 'music', label: '음악' },
    { value: 'art', label: '미술' },
    { value: 'cooking', label: '요리' },
    { value: 'sports', label: '운동' },
    { value: 'craft', label: '공예' },
    { value: 'etc', label: '기타' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddSchedule = (schedule) => {
    setSchedules(prev => [...prev, schedule]);
  };

  const handleRemoveSchedule = (index) => {
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = '제목을 입력해주세요';
    }

    if (!formData.description.trim()) {
      errors.description = '설명을 입력해주세요';
    }

    if (!formData.category) {
      errors.category = '카테고리를 선택해주세요';
    }

    if (!formData.location.trim()) {
      errors.location = '장소를 입력해주세요';
    }

    if (formData.maxParticipants < 1) {
      errors.maxParticipants = '최소 1명 이상이어야 합니다';
    }

    if (schedules.length === 0) {
      errors.schedules = '최소 1개 이상의 일정을 추가해주세요';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const talentData = {
        ...formData,
        schedules
      };

      const result = await execute(talentData);
      navigate(`/talents/${result.data.id}`);
    } catch (err) {
      console.error('Failed to create talent:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">재능 등록하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-2 font-semibold">제목 *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="예: 기초 피아노 레슨"
          />
          {formErrors.title && (
            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-semibold">설명 *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows="4"
            placeholder="어떤 재능을 나누고 싶으신가요?"
          />
          {formErrors.description && (
            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block mb-2 font-semibold">카테고리 *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">선택해주세요</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {formErrors.category && (
            <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
          )}
        </div>

        {/* Online/Offline */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isOnline"
              checked={formData.isOnline}
              onChange={handleChange}
              className="mr-2"
            />
            <span>온라인으로 진행</span>
          </label>
        </div>

        {/* Location */}
        <div>
          <label className="block mb-2 font-semibold">장소 *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder={formData.isOnline ? '예: Zoom' : '예: 서울 강남구'}
          />
          {formErrors.location && (
            <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
          )}
        </div>

        {/* Max Participants */}
        <div>
          <label className="block mb-2 font-semibold">최대 인원 *</label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            min="1"
            className="w-full border rounded px-3 py-2"
          />
          {formErrors.maxParticipants && (
            <p className="text-red-500 text-sm mt-1">{formErrors.maxParticipants}</p>
          )}
        </div>

        {/* Schedules */}
        <div>
          <label className="block mb-2 font-semibold">가능한 일정 *</label>
          <ScheduleInput onAdd={handleAddSchedule} />

          {schedules.length > 0 && (
            <div className="mt-4 space-y-2">
              {schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded"
                >
                  <span>
                    {schedule.date} {schedule.startTime} - {schedule.endTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(index)}
                    className="text-red-500"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          {formErrors.schedules && (
            <p className="text-red-500 text-sm mt-1">{formErrors.schedules}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default TalentRegisterPage;
```

### ScheduleInput Component
```javascript
// src/components/talents/ScheduleInput.jsx
import React, { useState } from 'react';

const ScheduleInput = ({ onAdd }) => {
  const [schedule, setSchedule] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchedule(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!schedule.date) {
      newErrors.date = '날짜를 선택해주세요';
    } else {
      const selectedDate = new Date(schedule.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = '과거 날짜는 선택할 수 없습니다';
      }
    }

    if (!schedule.startTime) {
      newErrors.startTime = '시작 시간을 선택해주세요';
    }

    if (!schedule.endTime) {
      newErrors.endTime = '종료 시간을 선택해주세요';
    }

    if (schedule.startTime && schedule.endTime) {
      if (schedule.endTime <= schedule.startTime) {
        newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (validate()) {
      onAdd(schedule);
      setSchedule({ date: '', startTime: '', endTime: '' });
    }
  };

  return (
    <div className="border p-4 rounded bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">날짜</label>
          <input
            type="date"
            name="date"
            value={schedule.date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">시작 시간</label>
          <input
            type="time"
            name="startTime"
            value={schedule.startTime}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">종료 시간</label>
          <input
            type="time"
            name="endTime"
            value={schedule.endTime}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        일정 추가
      </button>
    </div>
  );
};

export default ScheduleInput;
```

## Backend Implementation

### Talent Controller
```javascript
// server/controllers/talentController.js

// @desc    Create new talent with schedules
// @route   POST /api/talents
// @access  Private
exports.createTalent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      location,
      isOnline,
      maxParticipants,
      schedules
    } = req.body;

    // Create talent
    const talent = await Talent.create({
      userId: req.user.id,
      title,
      description,
      category,
      location,
      isOnline,
      maxParticipants
    });

    // Create schedules if provided
    if (schedules && schedules.length > 0) {
      const schedulePromises = schedules.map(schedule =>
        Schedule.create({
          talentId: talent._id,
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        })
      );

      await Promise.all(schedulePromises);
    }

    // Get talent with populated schedules
    const talentWithSchedules = await Talent.findById(talent._id)
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      data: talentWithSchedules
    });
  } catch (err) {
    next(err);
  }
};
```

### Validation Middleware
```javascript
// server/middleware/validator.js
const { body } = require('express-validator');

exports.validateTalent = [
  body('title')
    .trim()
    .notEmpty().withMessage('제목을 입력해주세요')
    .isLength({ max: 100 }).withMessage('제목은 100자를 초과할 수 없습니다'),

  body('description')
    .trim()
    .notEmpty().withMessage('설명을 입력해주세요')
    .isLength({ max: 1000 }).withMessage('설명은 1000자를 초과할 수 없습니다'),

  body('category')
    .notEmpty().withMessage('카테고리를 선택해주세요')
    .isIn(['programming', 'language', 'music', 'art', 'cooking', 'sports', 'craft', 'etc'])
    .withMessage('유효하지 않은 카테고리입니다'),

  body('location')
    .trim()
    .notEmpty().withMessage('장소를 입력해주세요'),

  body('maxParticipants')
    .isInt({ min: 1 }).withMessage('최소 1명 이상이어야 합니다'),

  body('schedules')
    .isArray({ min: 1 }).withMessage('최소 1개 이상의 일정을 추가해주세요'),

  body('schedules.*.date')
    .isISO8601().withMessage('유효한 날짜 형식이 아닙니다'),

  body('schedules.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('유효한 시간 형식이 아닙니다'),

  body('schedules.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('유효한 시간 형식이 아닙니다')
];
```

### Route
```javascript
// server/routes/talents.js
const express = require('express');
const router = express.Router();
const { createTalent } = require('../controllers/talentController');
const { protect } = require('../middleware/auth');
const { validateTalent } = require('../middleware/validator');
const { validationResult } = require('express-validator');

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

router.post('/', protect, validateTalent, checkValidation, createTalent);

module.exports = router;
```

## API Service
```javascript
// src/services/talentApi.js
export const talentApi = {
  createTalent: async (talentData) => {
    const response = await api.post('/talents', talentData);
    return response.data;
  }
};
```

## Testing Checklist
- [ ] Form validation works (frontend)
- [ ] Cannot submit without required fields
- [ ] Cannot add past dates
- [ ] End time must be after start time
- [ ] Multiple schedules can be added
- [ ] API validation works (backend)
- [ ] Talent and schedules are saved correctly
- [ ] User is redirected after success
- [ ] Error messages are displayed properly
- [ ] Only authenticated users can register talents

## When Working on This Feature
1. Implement frontend form first
2. Add client-side validation
3. Test UI thoroughly
4. Implement backend API
5. Add server-side validation
6. Test API with various inputs
7. Integrate frontend with backend
8. Handle all error cases
9. Test end-to-end flow

## Your Approach
- Build incrementally (UI → validation → API → integration)
- Validate on both client and server
- Provide clear error messages
- Handle edge cases
- Test thoroughly before moving on
