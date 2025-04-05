// src/Components/AuthLayout.js
import React from 'react';
import './AppLayout'
const AuthLayout = ({ children }) => {
    return (
        <div className="auth-container">
            <div className="auth-content">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
