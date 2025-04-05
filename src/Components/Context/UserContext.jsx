// src/Context/UserContext.js
import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};

// UserProvider component
export const UserProvider = ({ children }) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(null); // State to store user data
  const [token, setToken] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${apiUrl}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      
    } catch (err) {
      // setError("Failed to fetch received requests");
      console.error(err);
      setToken(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser, setToken, token }}>
      {children}
    </UserContext.Provider>
  );
};
