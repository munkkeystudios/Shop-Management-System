import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

// Use the same API URL as the rest of the application
const API_URL = 'http://localhost:5002/api';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setup axios instance with auth token
  const getAuthAxios = () => {
    const token = localStorage.getItem('token');
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
  };

  // Check for logged in user and set currentUserId
  useEffect(() => {
    const checkLoggedInUser = () => {
      const userJson = localStorage.getItem('user');
      console.log('User JSON from localStorage:', userJson);

      if (!userJson) {
        console.log('No user found in localStorage');
        setCurrentUserId(null);
        return;
      }

      try {
        const user = JSON.parse(userJson);
        console.log('Parsed user object:', user);
        const userId = user?.id || user?._id || null;
        console.log('Setting currentUserId to:', userId);
        setCurrentUserId(userId);
      } catch (err) {
        console.error('Error parsing user JSON:', err);
        setCurrentUserId(null);
      }
    };

    // Check on initial load
    checkLoggedInUser();

    // Set up event listener for storage changes (in case of login/logout in another tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkLoggedInUser();
      }
    });

    return () => {
      window.removeEventListener('storage', checkLoggedInUser);
    };
  }, []);

  // Fetch notifications from API when user changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUserId) {
        console.log('No user ID, checking localStorage for notifications');
        // Try to load from localStorage as fallback
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
          try {
            const parsedNotifications = JSON.parse(savedNotifications);
            console.log('Found notifications in localStorage:', parsedNotifications.length);
            setNotifications(parsedNotifications);
            setUnreadCount(parsedNotifications.filter(n => !n.read).length);
          } catch (err) {
            console.error('Error parsing localStorage notifications:', err);
            setNotifications([]);
            setUnreadCount(0);
          }
        } else {
          console.log('No notifications found in localStorage');
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching notifications for userId:', currentUserId);
        const authAxios = getAuthAxios();
        console.log('API URL:', API_URL);
        console.log('Auth headers:', authAxios.defaults.headers);

        const response = await authAxios.get('/notifications');
        console.log('Notifications API response:', response.data);

        if (response.data.success) {
          setNotifications(response.data.data);

          // Count unread notifications
          const unreadResponse = await authAxios.get('/notifications/unread-count');
          if (unreadResponse.data.success) {
            setUnreadCount(unreadResponse.data.count);
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to fetch notifications');
        // Fallback to empty state
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUserId]);

  // Update unread count whenever notifications change
  useEffect(() => {
    if (currentUserId) {
      const unread = notifications.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    }
  }, [notifications, currentUserId]);

  // Add a new notification
  const addNotification = async (type, message, entityId = null) => {
    console.log('addNotification called with:', { type, message, entityId });
    console.log('Current user ID:', currentUserId);

    // Only add notifications if a user is logged in
    if (currentUserId) {
      try {
        const authAxios = getAuthAxios();
        const response = await authAxios.post('/notifications', {
          type,
          message,
          entityId
        });

        if (response.data.success) {
          // Refresh notifications after adding a new one
          const notificationsResponse = await authAxios.get('/notifications');
          if (notificationsResponse.data.success) {
            setNotifications(notificationsResponse.data.data);
          }

          // Update unread count
          const unreadResponse = await authAxios.get('/notifications/unread-count');
          if (unreadResponse.data.success) {
            setUnreadCount(unreadResponse.data.count);
          }
        }
      } catch (err) {
        console.error('Error adding notification:', err);
        setError('Failed to add notification');

        // Fallback to client-side notification if API fails
        const newNotification = {
          _id: Date.now().toString(),
          type,
          message,
          entityId,
          userId: currentUserId,
          createdAt: new Date().toISOString(),
          read: false
        };

        setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
      }
    } else {
      console.log('No user ID available, using localStorage fallback');
      // Fallback to localStorage if no user is logged in
      const newNotification = {
        _id: Date.now().toString(),
        type,
        message,
        entityId,
        createdAt: new Date().toISOString(),
        read: false
      };

      // Get existing notifications from localStorage
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = [newNotification, ...existingNotifications];

      // Save back to localStorage
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

      // Update state
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    console.log('Marking notification as read:', id);

    // If no user ID, use localStorage
    if (!currentUserId) {
      console.log('No user ID, using localStorage for markAsRead');
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          const updatedNotifications = parsedNotifications.map(notification =>
            notification._id === id ? { ...notification, read: true } : notification
          );
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          setNotifications(updatedNotifications);
          setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        } catch (err) {
          console.error('Error updating localStorage notifications:', err);
        }
      }
      return;
    }

    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.patch(`/notifications/${id}/read`);

      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === id
              ? { ...notification, read: true }
              : notification
          )
        );

        // Update unread count
        const unreadResponse = await authAxios.get('/notifications/unread-count');
        if (unreadResponse.data.success) {
          setUnreadCount(unreadResponse.data.count);
        }
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');

      // Fallback to client-side update if API fails
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    console.log('Marking all notifications as read');

    // If no user ID, use localStorage
    if (!currentUserId) {
      console.log('No user ID, using localStorage for markAllAsRead');
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          const updatedNotifications = parsedNotifications.map(notification => ({ ...notification, read: true }));
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          setNotifications(updatedNotifications);
          setUnreadCount(0);
        } catch (err) {
          console.error('Error updating localStorage notifications:', err);
        }
      }
      return;
    }

    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.patch('/notifications/mark-all-read');

      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');

      // Fallback to client-side update if API fails
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };

  // Remove a notification
  const removeNotification = async (id) => {
    console.log('Removing notification:', id);

    // If no user ID, use localStorage
    if (!currentUserId) {
      console.log('No user ID, using localStorage for removeNotification');
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          const updatedNotifications = parsedNotifications.filter(notification => notification._id !== id);
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          setNotifications(updatedNotifications);
          setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        } catch (err) {
          console.error('Error updating localStorage notifications:', err);
        }
      }
      return;
    }

    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.delete(`/notifications/${id}`);

      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification._id !== id)
        );

        // Update unread count
        const unreadResponse = await authAxios.get('/notifications/unread-count');
        if (unreadResponse.data.success) {
          setUnreadCount(unreadResponse.data.count);
        }
      }
    } catch (err) {
      console.error('Error removing notification:', err);
      setError('Failed to remove notification');

      // Fallback to client-side update if API fails
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification._id !== id)
      );
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    console.log('Clearing all notifications');

    // If no user ID, use localStorage
    if (!currentUserId) {
      console.log('No user ID, using localStorage for clearAllNotifications');
      localStorage.setItem('notifications', JSON.stringify([]));
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.delete('/notifications');

      if (response.data.success) {
        // Update local state
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      setError('Failed to clear all notifications');

      // Fallback to client-side update if API fails
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Format timestamp to relative time (e.g., "2 minutes ago")
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        formatRelativeTime
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
