// src/Components/AppLayout.js
import React, { useEffect } from "react";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Chat from "../Pages/Chat/Chat";
import RequestSender from "../Pages/RequestSender/RequestSender";
import RequestReceiver from "../Pages/RequestReceiver/RequestReceiver";
import { useUser } from "./Context/UserContext";
import axios from "axios";


const apiUrl = import.meta.env.VITE_API_URL;
const MotionBox = motion(Box);

const AppLayout = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { token, setToken, setUser } = useUser();
  const { key } = useLocation(); 
  const navigate = useNavigate();
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${apiUrl}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      }, { withCredentials: true });
      
      setUser(response.data);
      
    } catch (err) {
      console.error(err);
      setToken(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token , key]);

  return (
    <Flex direction="column" height="100vh" bg="gray.50" >
      {/* Main Content */}
      <Flex flex="1" overflow="hidden">
        <AnimatePresence initial={false}>
          {!isMobile && (
            <MotionBox
              key="sidebar"
              initial={{ x: -250, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -250, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sidebar position="left" />
            </MotionBox>
          )}
        </AnimatePresence>

        <Box flex="1" p={0} overflowY="auto">
          <Routes>
            <Route path="chat" element={<Chat />} />
            <Route path="request-receiver" element={<RequestReceiver />} />
            <Route path="request-sender" element={<RequestSender />} />
            <Route path="user-profile" element={<RequestSender />} />
          </Routes>
        </Box>
      </Flex>

      {/* Bottom Navigation for Mobile */}
      <AnimatePresence>
        {isMobile && (
          <MotionBox
            key="bottom-nav"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Sidebar position="bottom" />
          </MotionBox>
        )}
      </AnimatePresence>
    </Flex>
  );
};

export default AppLayout;
