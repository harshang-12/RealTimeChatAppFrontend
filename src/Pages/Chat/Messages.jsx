import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../Components/Context/UserContext";
import axios from "axios";
import './Message.css';

const Messages = ({ selectedFriend }) => {

  console.log("selectedFriend", selectedFriend);

  const { user, token } = useUser(); // User context
  const [messages, setMessages] = useState([]); // All messages
  const [chatId, setChatId] = useState('')
  const [newMessage, setNewMessage] = useState(""); // Input field
  const ws = useRef(null); // WebSocket ref
  const apiUrl = import.meta.env.VITE_API_URL;

  // Establish WebSocket connection
  useEffect(() => {
    if (!selectedFriend || !user) return;

    ws.current = new WebSocket(`ws://localhost:8000`);

    ws.current.onopen = () => {
      console.log("✅ WebSocket connected");
      ws.current.send(
        JSON.stringify({ type: "authenticate", userId: user._id })
      );
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Message received:", data);

        if (data.type === "chat" && data.chatId) {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error("❌ Invalid WS message format:", err);
      }
    };

    ws.current.onclose = () => {
      console.log("🔌 WebSocket disconnected");
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [messages]);

  // Fetch existing chat messages
  useEffect(() => {
    if (!selectedFriend) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/chats/${selectedFriend._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("response ::: ", response.data);
        setChatId(response.data._id)
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedFriend]);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const messageData = {
      type: "chat",
      chatId: chatId,
      senderId: user._id,
      content: newMessage,
    };
    console.log("messegeData", messageData);

    ws.current.send(JSON.stringify(messageData));
    setNewMessage(""); // Clear input
  };



  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={(msg.sender._id == user._id || msg.sender == user._id) ? "sent" : "received"}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Messages;
