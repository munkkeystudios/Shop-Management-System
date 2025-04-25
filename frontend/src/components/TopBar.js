import React from 'react';
import { Link } from 'react-router-dom';
import { RiShoppingBag4Line } from 'react-icons/ri';
import NotificationIcon from './NotificationIcon';
import './TopBar.css';

const TopBar = ({ title }) => {

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user')) || { username: 'User' };

  return (
    <div className="topbar-container">
      <div className="topbar-left">
        <span className="topbar-title">{title}</span>
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
