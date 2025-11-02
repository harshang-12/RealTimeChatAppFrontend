import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Input,
  IconButton,
  VStack,
  Text,
  HStack,
  useColorModeValue,
  Avatar,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { useUser } from "../../Components/Context/UserContext";
import axios from "axios";

const Messages = ({ selectedFriend }) => {
  const { user, token } = useUser();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const ws = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const chatEndRef = useRef(null);

  const bgSent = useColorModeValue("blue.500", "blue.400");
  const bgReceived = useColorModeValue("gray.200", "gray.700");
  const textSent = useColorModeValue("white", "gray.100");
  const textReceived = useColorModeValue("black", "gray.100");

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket setup
  useEffect(() => {
    if (!selectedFriend || !user) return;

    // const socket = new WebSocket(`ws://localhost:8000`);
    const socket = new WebSocket(import.meta.env.VITE_WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: "authenticate", userId: user._id })
      );
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat" && data.chatId === chatId) {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket closed");
    };

    return () => socket.close();
  }, [selectedFriend, chatId, user]);

  // Fetch chat messages
  useEffect(() => {
    if (!selectedFriend) return;
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/chats/${selectedFriend._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatId(response.data._id);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedFriend]);

  // Send message (do not manually push to state)
  const sendMessage = () => {
    if (!newMessage.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const messageData = {
      type: "chat",
      chatId,
      senderId: user._id,
      content: newMessage.trim(),
    };

    ws.current.send(JSON.stringify(messageData));
    setNewMessage(""); // Clear input
  };

  return (
    <Flex direction="column" h="full">
      {/* Chat Messages */}
      <VStack
        flex="1"
        overflowY="auto"
        spacing={3}
        p={3}
        bg={useColorModeValue("gray.50", "gray.900")}
      >
        {messages.map((msg, index) => {
          const isSent = msg.sender?._id === user._id || msg.sender === user._id;
          return (
            <Flex
              key={index}
              w="full"
              justify={isSent ? "flex-end" : "flex-start"}
            >
              {!isSent && (
                <Avatar
                  name={selectedFriend.username}
                  size="sm"
                  mr={2}
                  bg="blue.400"
                  color="white"
                />
              )}
              <Box
                maxW="70%"
                px={4}
                py={2}
                borderRadius="lg"
                bg={isSent ? bgSent : bgReceived}
                color={isSent ? textSent : textReceived}
                boxShadow="sm"
              >
                <Text>{msg.content}</Text>
              </Box>
            </Flex>
          );
        })}
        <div ref={chatEndRef} />
      </VStack>

      {/* Input Section */}
      <HStack
        p={3}
        bg={useColorModeValue("white", "gray.800")}
        borderTop="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        w={"full"}
      >
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          bg={useColorModeValue("gray.100", "gray.700")}
          border="none"
          _focus={{ bg: "white", border: "1px solid", borderColor: "blue.400" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          w="80%"
        />
        <IconButton
          icon={<ArrowForwardIcon />}
          aria-label="Send"
          colorScheme="blue"
          onClick={sendMessage}
          w="20%"
        />
      </HStack>
    </Flex>
  );
};

export default Messages;
