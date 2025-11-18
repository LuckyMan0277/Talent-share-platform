const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  talentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Talent',
    required: true
  },
  date: {
    type: Date,
    required: [true, '날짜를 입력해주세요'],
    validate: {
      validator: function(value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value >= today;
      },
      message: '과거 날짜는 선택할 수 없습니다'
    }
  },
  startTime: {
    type: String,
    required: [true, '시작 시간을 입력해주세요'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식이 아닙니다 (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, '종료 시간을 입력해주세요'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식이 아닙니다 (HH:MM)']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying by talent and date
ScheduleSchema.index({ talentId: 1, date: 1 });

// Validate end time is after start time
ScheduleSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);

  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];

  if (endMinutes <= startMinutes) {
    return next(new Error('종료 시간은 시작 시간보다 늦어야 합니다'));
  }
  next();
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
