import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './styles/TopBar.css';

const TopBar = ({ onMenuToggle, isSidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    formatRelativeTime,
  } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const navItems = [
    { label: 'Sales', to: '/sales' },
    { label: 'Inventory', to: '/all_products' },
    { label: 'Orders', to: '/all_purchases' },
    { label: 'Analytics', to: '/sales-report' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'sale':
        return 'receipt_long';
      case 'product':
        return 'inventory_2';
      case 'purchase':
        return 'shopping_bag';
      case 'settings':
        return 'settings';
      case 'supplier':
        return 'local_shipping';
      case 'loan':
        return 'payments';
      case 'employee':
        return 'group';
      case 'category':
        return 'category';
      case 'brand':
        return 'sell';
      case 'system':
        return 'dns';
      default:
        return 'notifications';
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'product':
        return 'Low Stock Alert';
      case 'sale':
        return 'New Transaction Batch';
      case 'purchase':
        return 'Purchase Update';
      case 'settings':
        return 'System Status Update';
      case 'supplier':
        return 'Supplier Activity';
      case 'loan':
        return 'Loan Status Change';
      case 'employee':
        return 'Security Access Granted';
      case 'category':
        return 'Category Changes';
      case 'brand':
        return 'Brand Update';
      case 'import':
        return 'Import Completed';
      case 'system':
        return 'System Status Update';
      default:
        return 'Notification';
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
  };

  return (
    <header className="topbar-container">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-icon-btn topbar-menu-toggle"
          aria-label={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          onClick={onMenuToggle}
        >
          <span className="material-symbols-outlined">
            {isSidebarCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
  {/* brand removed for template parity */}
  <span className="topbar-brand" aria-hidden="true"></span>
        <nav className="topbar-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`topbar-nav-link ${isActive(item.to) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        <div className="topbar-notification-wrap" ref={notificationRef}>
          <button
            type="button"
            className={`topbar-icon-btn topbar-notification-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            aria-haspopup="menu"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && <span className="topbar-notification-indicator" aria-hidden="true"></span>}
          </button>

          {isNotificationsOpen && (
            <div className="topbar-notification-dropdown" role="menu" aria-label="Notifications dropdown">
              <div className="topbar-notification-head">
                <h3>Notifications</h3>
                <button
                  type="button"
                  className="topbar-notification-action"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </button>
              </div>

              <div className="topbar-notification-list">
                {loading ? (
                  <div className="topbar-notification-empty">Loading notifications...</div>
                ) : error ? (
                  <div className="topbar-notification-empty topbar-notification-error">{error}</div>
                ) : notifications.length === 0 ? (
                  <div className="topbar-notification-empty">No notifications yet</div>
                ) : (
                  notifications.slice(0, 8).map((notification) => (
                    <button
                      type="button"
                      key={notification._id}
                      className={`topbar-notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="topbar-notification-item-leading">
                        <span className="topbar-notification-item-icon-wrap">
                          <span className="material-symbols-outlined topbar-notification-item-icon">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </span>
                      </span>
                      <span className="topbar-notification-item-content">
                        <span className="topbar-notification-item-row">
                          <span className="topbar-notification-title">{getNotificationTitle(notification.type)}</span>
                          <span className="topbar-notification-time">{formatRelativeTime(notification.createdAt)}</span>
                        </span>
                        <span className="topbar-notification-message">{notification.message}</span>
                      </span>
                      {!notification.read && <span className="topbar-notification-item-dot" aria-hidden="true"></span>}
                    </button>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="topbar-notification-foot">
                  <button
                    type="button"
                    className="topbar-notification-action topbar-notification-clear"
                    onClick={clearAllNotifications}
                  >
                    Clear All Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown (avatar + menu) */}
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile-btn"
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            aria-label="Profile"
            onClick={() => setIsProfileOpen((prev) => !prev)}
          >
            {/* Only show the avatar cutout in the topbar (no text or extra icon) */}
            <span className="topbar-profile-avatar">{(user?.firstName || user?.name || 'A')[0]?.toUpperCase() || 'A'}</span>
          </button>

          {isProfileOpen && (
            <div className="topbar-profile-dropdown" role="menu" aria-label="Profile menu">
              <div className="topbar-profile-heading">
                <div className="topbar-profile-heading-title">Welcome</div>
                <div className="topbar-profile-heading-name">{(user?.firstName || user?.name || 'User')}</div>
              </div>

              <button
                type="button"
                className="topbar-logout-btn topbar-profile-settings"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/settings/user');
                }}
              >
                <span className="material-symbols-outlined">settings</span>
                <span>Profile settings</span>
              </button>

              <button
                type="button"
                className="topbar-logout-btn"
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
              >
                <span className="material-symbols-outlined">logout</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
