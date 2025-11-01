import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Components/Register';
import Login from './Components/Login';
import AppLayout from './Components/AppLayout';
import AuthLayout from './Components/AuthLayout';
import { useUser } from './Components/Context/UserContext';
import { Box, Spinner, Center } from '@chakra-ui/react';

const App = () => {
  const { user, token, setToken, loading } = useUser();

  

  // Optional: Show a loading spinner if your context or auth check is still initializing
  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <Router>
      <Box minH="100vh" bg="gray.50">
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Authentication Routes (with AuthLayout wrapper) */}
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />

          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login setToken={setToken} />
              </AuthLayout>
            }
          />

          {/* Protected App Routes */}
          <Route
            path="/app/*"
            element={ <AppLayout /> }
          />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
