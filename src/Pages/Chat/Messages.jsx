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
  Spinner,
} from "@chakra-ui/react";
import { ArrowForwardIcon, AttachmentIcon } from "@chakra-ui/icons";
import { useUser } from "../../Components/Context/UserContext";
import axios from "axios";
import TypingIndicator from "../../Components/TypingIndicator";

const Messages = ({ selectedFriend }) => {
  const { user, token } = useUser();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [counter, setCounter] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const ws = useRef(null);
  const typingTimeout = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const bgSent = useColorModeValue("blue.500", "blue.400");
  const bgReceived = useColorModeValue("gray.200", "gray.700");
  const textSent = useColorModeValue("white", "gray.100");
  const textReceived = useColorModeValue("black", "gray.100");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [counter , messages , isFriendTyping]);

  // Initialize WebSocket
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

        if (data.type === "typing" && data.chatId === chatId && data.senderId !== user._id) setIsFriendTyping(true);
        if (data.type === "stop_typing" && data.chatId === chatId && data.senderId !== user._id) setIsFriendTyping(false);
      } catch { }
    };

    socket.onclose = () => console.log("🔌 WebSocket closed");
    return () => socket.close();
  }, [selectedFriend, chatId, user]);

  // Fetch chat messages (first load)
  useEffect(() => {
    if (!selectedFriend) return;
    setPage(1);
    setHasMore(true);

    const fetchMessages = async () => {
      const res = await axios.get(`${apiUrl}/chats/${selectedFriend._id}?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatId(res.data.chatId);
      setMessages(res.data.messages);
      setHasMore(res.data.messages.length === 20);
    };

    fetchMessages();
  }, [selectedFriend]);


  // 🔥 Load older messages on scroll top
  const loadMoreMessages = async () => {
    if (!hasMore || loadingRef.current) return;

    setIsLoadingMore(true);
    loadingRef.current = true;

    const previousHeight = chatScrollRef.current.scrollHeight;

    const nextPage = page + 1;
    const res = await axios.get(
      `${apiUrl}/chats/${selectedFriend._id}?page=${nextPage}&limit=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newMessages = res.data.messages;
    if (newMessages.length < 20) setHasMore(false);

    setMessages((prev) => [...newMessages, ...prev]);
    setPage(nextPage);

    setTimeout(() => {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight - previousHeight;
      loadingRef.current = false;
      setIsLoadingMore(false);
    }, 80);
  };


  const onScroll = () => {
    if (chatScrollRef.current.scrollTop < 20) loadMoreMessages();
  };

  // Send message
  const sendMessage = (type = "text", fileData = null) => {
    if ((!newMessage.trim() && !fileData) || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({
      type: "chat",
      chatId,
      senderId: user._id,
      content: type === "text" ? newMessage.trim() : fileData.url,
      messageType: type,
      fileType: fileData?.fileType,
    }));
    setNewMessage("");
    ws.current.send(JSON.stringify({ type: "stop_typing", chatId, senderId: user._id }));

    setCounter((prev) => prev + 1);
  };

  // File upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${apiUrl}/upload`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });

    const fileData = {
      url: res.data.fileUrl,
      fileType: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document",
    };

    sendMessage(fileData.fileType, fileData);
  };

  // Typing
  const handleTyping = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "typing", chatId, senderId: user._id }));
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      ws.current?.send(JSON.stringify({ type: "stop_typing", chatId, senderId: user._id }));
    }, 1200);
  };

  return (
    <Flex direction="column" w="full" h="full">
      <VStack
        ref={chatScrollRef}
        onScroll={onScroll}
        flex="1"
        overflowY="auto"
        spacing={3}
        p={2}
        bg="gray.50"
      >
        {isLoadingMore && (
          <Flex w="full" justify="center" p={1}>
            <Spinner color="brand.500" />
          </Flex>
        )}
        {messages.map((msg, index) => {
          const isSent = msg.sender === user._id || msg.sender?._id === user._id;
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
                  <a href={`${import.meta.env.VITE_UPLOAD_URL}${msg.content}`} target="_blank">📄 View Document</a>
                ) : (
                  <Text>{msg.content}</Text>
                )}
              </Box>
            </Flex>
          );
        })}

        {isFriendTyping && (
          <Flex w="full" justify="flex-start" align="center" mt={-3}>
            <Avatar name={selectedFriend.username} size="sm" mr={2} />
            <TypingIndicator />
          </Flex>
        )}
        <div ref={chatEndRef} />
      </VStack>

      <HStack p={2} bg="white" borderTop="1px solid" borderColor="gray.200">
        <IconButton icon={<AttachmentIcon />} aria-label="Attach" onClick={() => fileInputRef.current.click()} colorScheme="blue" w="50px" />
        <Input ref={fileInputRef} type="file" display="none" accept="image/*,video/*,application/pdf" onChange={handleFileSelect} />
        <Input placeholder="Type a message..." value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
        <IconButton w="50px" icon={<ArrowForwardIcon />} aria-label="Send" colorScheme="blue" onClick={() => sendMessage()} />
      </HStack>
    </Flex>
  );
};

export default Messages;
