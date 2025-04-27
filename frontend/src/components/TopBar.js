import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiShoppingBag4Line } from 'react-icons/ri';
import { FaChevronRight } from 'react-icons/fa';
import NotificationIcon from './NotificationIcon';
import { getBreadcrumbs } from '../utils/pathUtils';
import './TopBar.css';

const TopBar = () => {
  const location = useLocation();

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user')) || { username: 'User' };

  // Get breadcrumbs for current path
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="topbar-container">
      <div className="topbar-left">
        <div className="topbar-breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path + index}>
              {index > 0 && <FaChevronRight className="breadcrumb-separator" />}
              {crumb.isVirtual ? (
                <span className="breadcrumb-item">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
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

        <div className="topbar-user-profile">
          <div className="topbar-user-avatar">
            {userInfo.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
