import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar'; // Assuming Sidebar is in the same folder
import Chat from '../Pages/Chat/Chat';
import Header from './Header'; // Import the Header component
import RequestSender from '../Pages/RequestSender/RequestSender';
import RequestReceiver from '../Pages/RequestReceiver/RequestReceiver';

function AppLayout() {
  return (
    <div className="app-layout">
      <Header /> {/* Add the Header here */}
      <div className="main-content">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="chat" element={<Chat />} />
            <Route path="request-receiver" element={<RequestReceiver />} />
            <Route path="request-sender" element={<RequestSender />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
