const Talent = require('../models/Talent');
const Booking = require('../models/Booking');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

// @desc    Get user's registered talents
// @route   GET /api/users/my-talents
// @access  Private
exports.getMyTalents = asyncHandler(async (req, res, next) => {
  const talents = await Talent.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: talents.length,
    data: talents
  });
});

// @desc    Get user's bookings
// @route   GET /api/users/my-bookings
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ userId: req.user.id })
    .populate('talentId', 'title description category location')
    .populate('scheduleId')
    .populate({
      path: 'talentId',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get bookings received for user's talents
// @route   GET /api/users/received-bookings
// @access  Private
exports.getReceivedBookings = asyncHandler(async (req, res, next) => {
  // Get user's talents
  const talents = await Talent.find({ userId: req.user.id });
  const talentIds = talents.map(talent => talent._id);

  // Get bookings for those talents
  const bookings = await Booking.find({ talentId: { $in: talentIds } })
    .populate('userId', 'name email')
    .populate('talentId', 'title description category')
    .populate('scheduleId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: '사용자를 찾을 수 없습니다'
    });
  }

  // Update name if provided
  if (name) {
    user.name = name;
  }

  // Update profile image if uploaded
  if (req.file) {
    user.profileImage = `/uploads/profiles/${req.file.filename}`;
  }

  // Update password if provided
  if (currentPassword && newPassword) {
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호가 일치하지 않습니다'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage
    }
  });
});
