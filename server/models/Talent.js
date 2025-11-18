const mongoose = require('mongoose');

const TalentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, '제목을 입력해주세요'],
    trim: true,
    maxlength: [100, '제목은 100자를 초과할 수 없습니다']
  },
  description: {
    type: String,
    required: [true, '설명을 입력해주세요'],
    maxlength: [1000, '설명은 1000자를 초과할 수 없습니다']
  },
  category: {
    type: String,
    required: [true, '카테고리를 선택해주세요'],
    enum: [
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
    ]
  },
  location: {
    type: String,
    required: [true, '장소를 입력해주세요'],
    maxlength: [200, '장소는 200자를 초과할 수 없습니다']
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    required: [true, '최대 인원을 입력해주세요'],
    min: [1, '최소 1명 이상이어야 합니다']
  },
  image: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
TalentSchema.index({ title: 'text', description: 'text' });
TalentSchema.index({ category: 1, createdAt: -1 });

// Cascade delete schedules when talent is deleted
TalentSchema.pre('remove', async function(next) {
  await this.model('Schedule').deleteMany({ talentId: this._id });
  await this.model('Booking').deleteMany({ talentId: this._id });
  next();
});

module.exports = mongoose.model('Talent', TalentSchema);
