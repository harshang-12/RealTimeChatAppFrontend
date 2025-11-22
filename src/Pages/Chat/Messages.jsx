// src/Pages/Chat/Messages.jsx
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
import TypingIndicator from "../../Components/TypingIndicator";

const Messages = ({ selectedFriend, wsRef, onUpdateFriend }) => {
  const { user, token } = useUser();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  const typingTimeout = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const ws = wsRef?.current; // use existing wsRef from Chat

  const bgSent = useColorModeValue("blue.500", "blue.400");
  const bgReceived = useColorModeValue("gray.200", "gray.700");
  const textSent = useColorModeValue("white", "gray.100");
  const textReceived = useColorModeValue("black", "gray.100");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isFriendTyping]);

  // Fetch messages when friend changes
  useEffect(() => {
    if (!selectedFriend) return;
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/chats/${selectedFriend._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatId(response.data._id);
        setMessages(response.data.messages || []);

        // reset unread for this friend on open
        if (onUpdateFriend) {
          onUpdateFriend({ id: selectedFriend._id, unread: 0 });
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [selectedFriend]);

  // Setup ws message listener for chat/typing events (only once)
  useEffect(() => {
    if (!wsRef || !wsRef.current) return;
    const socket = wsRef.current;

    const handler = (event) => {
      try {
        const data = JSON.parse(event.data);

        // chat message (append only when matches chatId)
        if (data.type === "chat" && data.chatId === chatId) {
          setMessages((prev) => [...prev, data.message]);
          // clear typing indicator and ensure scroll
          setIsFriendTyping(false);
        } else if (data.type === "typing" && data.chatId === chatId && data.senderId === selectedFriend?._id) {
          setIsFriendTyping(true);
        } else if (data.type === "stop_typing" && data.chatId === chatId && data.senderId === selectedFriend?._id) {
          setIsFriendTyping(false);
        }
      } catch (err) {
        console.error("Invalid WS message (Messages):", err);
      }
    };

    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [wsRef, chatId, selectedFriend]);

  // Send message
  const sendMessage = (type = "text", fileData = null) => {
    if ((!newMessage.trim() && !fileData) || !wsRef?.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const messageData = {
      type: "chat",
      chatId,
      senderId: user._id,
      content: type === "text" ? newMessage.trim() : fileData?.url,
      messageType: type,
      fileType: fileData?.fileType,
    };

    wsRef.current.send(JSON.stringify(messageData));
    setNewMessage("");

    // stop typing notify immediately
    wsRef.current.send(JSON.stringify({
      type: "stop_typing",
      chatId,
      senderId: user._id,
    }));

    // optimistic append (optional)
    setMessages((prev) => [...prev, { ...messageData, timestamp: new Date(), sender: user._id }]);
    if (onUpdateFriend) {
      onUpdateFriend({ id: selectedFriend._id, lastMessage: messageData.content });
    }
  };

  // File upload handler
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

      sendMessage(fileData.fileType, fileData);
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  // Typing handler
  const handleTyping = () => {
    if (!wsRef?.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: "typing",
      chatId,
      senderId: user._id,
    }));

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      wsRef.current?.send(JSON.stringify({
        type: "stop_typing",
        chatId,
        senderId: user._id,
      }));
    }, 1200);
  };

  return (
    <Flex direction="column" w="full" h="full">
      <VStack flex="1" overflowY="auto" spacing={3} p={2} bg="gray.50">
        {messages.map((msg, index) => {
          const isSent = (msg.sender?._id && msg.sender._id === user._id) || msg.sender === user._id;
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

        {/* Typing bubble under messages (left aligned) */}
        {isFriendTyping && (
          <Flex w="full" justify="flex-start" align="center" pl="45px" mt={-3}>
            <TypingIndicator />
          </Flex>
        )}

        <div ref={chatEndRef} />
      </VStack>

      <HStack p={2} bg="white" borderTop="1px solid" borderColor="gray.200">
        <IconButton icon={<AttachmentIcon />} aria-label="Attach" onClick={() => fileInputRef.current.click()} colorScheme="blue" w="50px" />
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
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <IconButton w="50px" icon={<ArrowForwardIcon />} aria-label="Send" colorScheme="blue" onClick={() => sendMessage()} />
      </HStack>
    </Flex>
  );
};

export default Messages;
