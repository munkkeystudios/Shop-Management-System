import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaUser } from 'react-icons/fa';
import { RiShoppingBag4Line } from 'react-icons/ri';
import './TopBar.css';

const TopBar = ({ title, showBackButton = false }) => {
  const location = useLocation();

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

        <div className="topbar-language-selector">
          <select className="topbar-language-select">
            <option value="en">En</option>
            <option value="es">Es</option>
            <option value="fr">Fr</option>
          </select>
        </div>

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
