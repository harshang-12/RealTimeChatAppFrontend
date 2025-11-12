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
import { ArrowForwardIcon, AttachmentIcon } from "@chakra-ui/icons";
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
  const fileInputRef = useRef(null);

  const bgSent = useColorModeValue("blue.500", "blue.400");
  const bgReceived = useColorModeValue("gray.200", "gray.700");
  const textSent = useColorModeValue("white", "gray.100");
  const textReceived = useColorModeValue("black", "gray.100");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedFriend || !user) return;

    const socket = new WebSocket(import.meta.env.VITE_WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "authenticate", userId: user._id }));
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

    socket.onclose = () => console.log("🔌 WebSocket closed");
    return () => socket.close();
  }, [selectedFriend, chatId, user]);

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

  const sendMessage = (type = "text", fileData = null) => {
    if ((!newMessage.trim() && !fileData) || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const messageData = {
      type: "chat",
      chatId,
      senderId: user._id,
      content: type === "text" ? newMessage.trim() : fileData?.url,
      messageType: type,
      fileType: fileData?.fileType,
    };

    ws.current.send(JSON.stringify(messageData));
    setNewMessage("");
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const fileData = {
        url: res.data.fileUrl,
        fileType: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "document",
      };

      console.log(fileData );
      

      sendMessage(fileData.fileType, fileData);
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  return (
    <Flex direction="column" w="full" h="full">
      <VStack flex="1" overflowY="auto" spacing={3} p={2} bg="gray.50">
        {messages.map((msg, index) => {
          const isSent = msg.sender?._id === user._id || msg.sender === user._id;
          return (
            <Flex key={index} w="full" justify={isSent ? "flex-end" : "flex-start"}>
              {!isSent && <Avatar name={selectedFriend.username} size="sm" mr={2} />}
              <Box
                maxW="70%"
                px={3}
                py={2}
                borderRadius="lg"
                bg={isSent ? bgSent : bgReceived}
                color={isSent ? textSent : textReceived}
                boxShadow="sm"
              >
                {msg.messageType === "image" ? (
                  <img src={`${import.meta.env.VITE_UPLOAD_URL}${msg.content}`} alt="media" style={{ borderRadius: 8, maxWidth: "200px" }} />
                ) : msg.messageType === "video" ? (
                  <video src={`${import.meta.env.VITE_UPLOAD_URL}${msg.content}`} controls style={{ borderRadius: 8, maxWidth: "200px" }} />
                ) : msg.messageType === "document" ? (
                  <a href={`${import.meta.env.VITE_UPLOAD_URL}${msg.content}`} target="_blank" rel="noopener noreferrer">
                    📄 View Document
                  </a>
                ) : (
                  <Text>{msg.content}</Text>
                )}
              </Box>
            </Flex>
          );
        })}
        <div ref={chatEndRef} />
      </VStack>

      <HStack p={2} bg="white" borderTop="1px solid" borderColor="gray.200">
        <IconButton
          icon={<AttachmentIcon />}
          aria-label="Attach"
          onClick={() => fileInputRef.current.click()}
          colorScheme="blue"
          w={'50px'}
        />
        <Input
          ref={fileInputRef}
          type="file"
          display="none"  
          accept="image/*,video/*,application/pdf"
          onChange={handleFileSelect}
        />
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          
        />
        <IconButton  w={'50px'} icon={<ArrowForwardIcon />} aria-label="Send" colorScheme="blue" onClick={() => sendMessage()} />
      </HStack>
    </Flex>
  );
};

export default Messages;
