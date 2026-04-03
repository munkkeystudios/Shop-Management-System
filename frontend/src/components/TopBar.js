import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RiShoppingBag4Line } from 'react-icons/ri';
import { FaSignOutAlt, FaCog } from 'react-icons/fa';
import { FiMenu, FiChevronLeft } from 'react-icons/fi';
import NotificationIcon from './NotificationIcon';
import { getBreadcrumbs } from '../utils/pathUtils';
import { useAuth } from '../context/AuthContext';
import './styles/TopBar.css';

const TopBar = ({ onMenuToggle, isSidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Get user info from context or localStorage
  const userInfo = user || JSON.parse(localStorage.getItem('userData')) || { username: 'User' };

  // Get breadcrumbs for current path and derive current page label
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const currentCrumb = breadcrumbs[breadcrumbs.length - 1];

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="topbar-container">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-button"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          {isSidebarCollapsed ? <FiMenu size={20} /> : <FiChevronLeft size={20} />}
        </button>
        <div className="topbar-page-title">
          {currentCrumb ? currentCrumb.label : 'Dashboard'}
        </div>
      </div>

      <div className="topbar-center">
        {/* Center section is now empty */}
      </div>

      <div className="topbar-right">
        <Link to="/pos" className="topbar-pos-button">
          POS <RiShoppingBag4Line className="pos-icon" />
        </Link>

        <NotificationIcon />

        <div className="topbar-user-profile" ref={userDropdownRef}>
          <div
            className="topbar-user-avatar"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            {userInfo.firstName ? userInfo.firstName.charAt(0).toUpperCase() : userInfo.username.charAt(0).toUpperCase()}
          </div>

          {isUserDropdownOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-dropdown-name">
                  {userInfo.firstName && userInfo.lastName
                    ? `${userInfo.firstName} ${userInfo.lastName}`
                    : userInfo.username}
                </div>
                <div className="user-dropdown-role">
                  {userInfo.role ? userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1) : 'User'}
                </div>
              </div>

              <div className="user-dropdown-menu">
                <Link to="/settings/user" className="user-dropdown-item">
                  <FaCog className="user-dropdown-icon" />
                  <span>Settings</span>
                </Link>

                <div className="user-dropdown-divider"></div>

                <div className="user-dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt className="user-dropdown-icon" />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
