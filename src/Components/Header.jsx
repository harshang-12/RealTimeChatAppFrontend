import React from 'react';
import './Header.css'; // You can create your own styles for the header
import { useUser } from './Context/UserContext';

function Header() {
    const {user} = useUser();
  const username = user?.username; // You can replace this with dynamic data from a context or props

  return (
    <div className="header">
      <div className="profile">
        <div className="profile-icon">
          {/* You can replace this with an actual profile picture or icon */}
          <img src="https://via.placeholder.com/40" alt="Profile" />
        </div>
        <div className="username">
          <span>{username}</span>
        </div>
      </div>
    </div>
  );
}

export default Header;
