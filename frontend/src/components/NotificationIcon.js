import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaRegBell, FaBox, FaTag, FaFolder, FaTruck } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';
import './NotificationIcon.css';

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    formatRelativeTime
  } = useNotifications();

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'product':
        return <FaBox />;
      case 'brand':
        return <FaTag />;
      case 'category':
        return <FaFolder />;
      case 'supplier':
        return <FaTruck />;
      default:
        return <FaBell />;
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button
        className={`notification-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={toggleDropdown}
        title="Notifications"
      >
        {unreadCount > 0 ? <FaBell /> : <FaRegBell />}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <div className="notification-actions">
                <button
                  className="mark-all-read-button"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <p>Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="notification-error">
                <p>{error}</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <button
                    className="notification-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification._id);
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                className="clear-all-button"
                onClick={clearAllNotifications}
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
