import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Components/Register';
import Login from './Components/Login';
import AppLayout from './Components/AppLayout';
import AuthLayout from './Components/AuthLayout';
import { useUser } from './Components/Context/UserContext';

const App = () => {
    const { user, token , setToken } = useUser();


    console.log("userAppRoutes : " , user);
    
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
                
                {/* Use AuthLayout for authentication pages */}
                <Route path="/register" element={
                    <AuthLayout>
                        <Register />
                    </AuthLayout>
                } />
                
                <Route path="/login" element={
                    <AuthLayout>
                        <Login setToken={setToken} />
                    </AuthLayout>
                } />
        {/* Protect /app routes, redirect to login if user is not authenticated */}
        <Route
          path="/app/*"
          element={token ? <AppLayout /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
