const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {Object} data - Notification data
 * @param {String} data.userId - User ID to receive notification
 * @param {String} data.type - Notification type
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.relatedTalent - Related talent ID (optional)
 * @param {String} data.relatedBooking - Related booking ID (optional)
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedTalent: data.relatedTalent,
      relatedBooking: data.relatedBooking
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

module.exports = createNotification;
