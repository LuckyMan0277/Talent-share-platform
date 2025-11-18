const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { unreadOnly } = req.query;

  const query = { userId: req.user.id };

  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .populate('relatedTalent', 'title')
    .populate('relatedBooking')
    .sort({ createdAt: -1 })
    .limit(50); // Limit to last 50 notifications

  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: '알림을 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '권한이 없습니다'
    });
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: '모든 알림을 읽음으로 표시했습니다'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: '알림을 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '권한이 없습니다'
    });
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    count
  });
});
