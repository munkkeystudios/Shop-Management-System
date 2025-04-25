const Notification = require('../models/notification');
const mongoose = require('mongoose');

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to most recent 100 notifications
    
    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { type, message, entityId } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type and message are required'
      });
    }
    
    // Create notification
    const notification = await Notification.create({
      userId,
      type,
      message,
      entityId: entityId || null,
      read: false
    });
    
    return res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }
    
    // Find and update notification
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or not owned by user'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    return res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }
    
    // Find and delete notification
    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or not owned by user'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Delete all notifications for a user
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete all notifications for the user
    const result = await Notification.deleteMany({ userId });
    
    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete all notifications',
      error: error.message
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count unread notifications
    const count = await Notification.countDocuments({ userId, read: false });
    
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to count unread notifications',
      error: error.message
    });
  }
};
