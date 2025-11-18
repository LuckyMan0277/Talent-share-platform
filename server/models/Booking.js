const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  talentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Talent',
    required: true
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for user bookings
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ talentId: 1, scheduleId: 1 });

// Prevent duplicate bookings
BookingSchema.index(
  { userId: 1, scheduleId: 1 },
  { unique: true }
);

// Update schedule participant count on booking
BookingSchema.post('save', async function() {
  const Schedule = mongoose.model('Schedule');
  const count = await mongoose.model('Booking').countDocuments({
    scheduleId: this.scheduleId,
    status: { $ne: 'cancelled' }
  });

  await Schedule.findByIdAndUpdate(this.scheduleId, {
    currentParticipants: count
  });
});

// Update participant count when booking is cancelled
BookingSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'cancelled') {
    const Schedule = mongoose.model('Schedule');
    const count = await mongoose.model('Booking').countDocuments({
      scheduleId: doc.scheduleId,
      status: { $ne: 'cancelled' }
    });

    await Schedule.findByIdAndUpdate(doc.scheduleId, {
      currentParticipants: count
    });
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
