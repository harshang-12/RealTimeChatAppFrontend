import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaComments, FaInbox, FaPaperPlane, FaClock, FaUser, FaBars } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { to: "/app/chat/", icon: <FaComments className="icon" />, label: "Chat" },
    { to: "/app/request-receiver", icon: <FaInbox className="icon" />, label: "Request Receiver" },
    { to: "/app/request-sender", icon: <FaPaperPlane className="icon" />, label: "Request Sender" },
    { to: "/app/punch-in-out", icon: <FaClock className="icon" />, label: "Punch In/Out" },
    { to: "/app/user-profile", icon: <FaUser className="icon" />, label: "User Profile" },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <div className="sidebar-menu">
        <ul className="sidebar-list">
          {menuItems.map((item, index) => (
            <li key={index} className="sidebar-item">
              <NavLink
                to={item.to}
                className="sidebar-link"
                activeClassName="active"
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
