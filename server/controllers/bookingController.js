const Booking = require('../models/Booking');
const Talent = require('../models/Talent');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const createNotification = require('../utils/createNotification');

// @desc    Get all bookings for current user
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ userId: req.user.id })
    .populate('talentId', 'title description category location contact')
    .populate('scheduleId')
    .populate('talentId.userId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('talentId')
    .populate('scheduleId');

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: '예약을 찾을 수 없습니다'
    });
  }

  // Check if user owns the booking or the talent
  const talent = await Talent.findById(booking.talentId);

  if (
    booking.userId.toString() !== req.user.id &&
    talent.userId.toString() !== req.user.id
  ) {
    return res.status(403).json({
      success: false,
      error: '권한이 없습니다'
    });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { talentId, scheduleId } = req.body;

  // Check if talent exists
  const talent = await Talent.findById(talentId);

  if (!talent) {
    return res.status(404).json({
      success: false,
      error: '재능을 찾을 수 없습니다'
    });
  }

  // Check if schedule exists
  const schedule = await Schedule.findById(scheduleId);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      error: '일정을 찾을 수 없습니다'
    });
  }

  // Check if schedule belongs to talent
  if (schedule.talentId.toString() !== talentId) {
    return res.status(400).json({
      success: false,
      error: '잘못된 일정입니다'
    });
  }

  // Check if user is trying to book their own talent
  if (talent.userId.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      error: '자신의 재능은 신청할 수 없습니다'
    });
  }

  // Check if schedule is full
  if (schedule.currentParticipants >= talent.maxParticipants) {
    return res.status(400).json({
      success: false,
      error: '신청 인원이 마감되었습니다'
    });
  }

  // Check if user already booked this schedule
  const existingBooking = await Booking.findOne({
    userId: req.user.id,
    scheduleId,
    status: { $ne: 'cancelled' }
  });

  if (existingBooking) {
    return res.status(400).json({
      success: false,
      error: '이미 신청한 일정입니다'
    });
  }

  // Create booking
  const booking = await Booking.create({
    userId: req.user.id,
    talentId,
    scheduleId,
    status: 'confirmed'
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate('talentId', 'title description category contact')
    .populate('scheduleId');

  // Create notification for talent owner
  const user = await User.findById(req.user.id);
  const scheduleDate = new Date(schedule.date).toLocaleDateString('ko-KR');

  try {
    await createNotification({
      userId: talent.userId,
      type: 'booking_created',
      title: '새로운 수업 신청',
      message: `${user.name}님이 "${talent.title}" 수업을 신청했습니다. (일정: ${scheduleDate} ${schedule.startTime}) | 신청자 연락처: ${user.email}`,
      relatedTalent: talentId,
      relatedBooking: booking._id
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    // Continue even if notification fails
  }

  // Create notification for booking user with contact info
  try {
    await createNotification({
      userId: req.user.id,
      type: 'booking_confirmed',
      title: '수업 신청 완료',
      message: `"${talent.title}" 수업 신청이 완료되었습니다. (일정: ${scheduleDate} ${schedule.startTime}) | 강사 연락처: ${talent.contact}`,
      relatedTalent: talentId,
      relatedBooking: booking._id
    });
  } catch (err) {
    console.error('Failed to create notification for user:', err);
    // Continue even if notification fails
  }

  res.status(201).json({
    success: true,
    data: populatedBooking
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: '예약을 찾을 수 없습니다'
    });
  }

  // Check ownership (only the user who made the booking can update it)
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '권한이 없습니다'
    });
  }

  const { status } = req.body;

  booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  ).populate('talentId', 'title description')
   .populate('scheduleId');

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking (delete)
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('talentId')
    .populate('scheduleId');

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: '예약을 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '권한이 없습니다'
    });
  }

  // Update status to cancelled instead of deleting
  booking.status = 'cancelled';
  await booking.save();

  // Create notification for talent owner
  const user = await User.findById(req.user.id);
  const talent = booking.talentId;
  const schedule = booking.scheduleId;
  const scheduleDate = new Date(schedule.date).toLocaleDateString('ko-KR');

  try {
    await createNotification({
      userId: talent.userId,
      type: 'booking_cancelled',
      title: '수업 신청 취소',
      message: `${user.name}님이 "${talent.title}" 수업 신청을 취소했습니다. (일정: ${scheduleDate} ${schedule.startTime})`,
      relatedTalent: talent._id,
      relatedBooking: booking._id
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    // Continue even if notification fails
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});
