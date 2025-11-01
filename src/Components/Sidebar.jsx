// src/Components/Sidebar.js
import React from "react";
import {
  Flex,
  IconButton,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaComments, FaInbox, FaPaperPlane, FaUser } from "react-icons/fa";
import {  useUser } from "./Context/UserContext";


const MotionVStack = motion(VStack);
const MotionFlex = motion(Flex);

const menuItems = [
  { to: "/app/chat", icon: FaComments, label: "Chat" },
  { to: "/app/request-receiver", icon: FaInbox, label: "Receiver" },
  { to: "/app/request-sender", icon: FaPaperPlane, label: "Sender" },
  { to: "/app/user-profile", icon: FaUser, label: "Profile" },
];

const Sidebar = ({ position }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeColor = useColorModeValue("blue.500", "blue.300");


  
  const {user} =  useUser();

  

  // Left Sidebar (Desktop)
  if (position === "left") {
    return (
      <MotionVStack
        as="nav"
        bg={bg}
        borderRight="1px"
        borderColor={borderColor}
        w="220px"
        minH="100vh"
        spacing={4}
        p={4}
        align="stretch"
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -250, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Text fontSize="xl" fontWeight="bold" mb={4}>{user?.username}</Text>
        {menuItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              color: isActive ? activeColor : "inherit",
              textDecoration: "none",
            })}
          >
            <HStack
              as={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              spacing={3}
              p={2}
              rounded="md"
              _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
            >
              <Icon size="20" />
              <Text fontWeight="medium">{label}</Text>
            </HStack>
          </NavLink>
        ))}
      </MotionVStack>
    );
  }

  // Bottom Navbar (Mobile)
  return (
    <MotionFlex
      as="nav"
      bg={bg}
      borderTop="1px"
      borderColor={borderColor}
      justify="space-around"
      align="center"
      p={2}
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="10"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.25 }}
    >

      
      {menuItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            color: isActive ? activeColor : "inherit",
            textDecoration: "none",
          })}
        >
          <VStack spacing={0}>
            <IconButton
              as={motion.button}
              aria-label={label}
              icon={<Icon />}
              variant="ghost"
              fontSize="20px"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <Text fontSize="xs">{label}</Text>
          </VStack>
        </NavLink>
      ))}
    </MotionFlex>
  );
};

export default Sidebar;
