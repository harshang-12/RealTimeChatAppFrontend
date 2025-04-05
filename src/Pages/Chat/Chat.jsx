import React, { useEffect, useState } from "react";
import "./Chat.css"; // Make sure to include the updated CSS file
import { useUser } from "../../Components/Context/UserContext";
import axios from "axios";
import Messages from "./Messages";

function Chat() {
  const { user, token } = useUser();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null); // State to track selected friend

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${apiUrl}/user/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFriends(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend); // Set the clicked friend as the selected one
  };

  useEffect(() => {
    fetchFriends();
  }, [user]);

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <h2 className="sidebar-heading">Friends</h2>
        <ul className="friend-list">
          {friends?.length > 0 ? (
            friends?.map((friend, index) => (
              <li
                key={index}
                className="friend-list-item"
                onClick={() => handleFriendClick(friend)} // Handle click on friend's name
              >
                {friend?.username}
              </li>
            ))
          ) : (
            <li className="friend-list-empty">No friends available</li>
          )}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="chat-content">
        <h2 className="chat-heading">
          {selectedFriend ? ` ${selectedFriend.username}` : "Chat "}
        </h2>
        <div className="message-display">
          {selectedFriend ? (
            <Messages selectedFriend={selectedFriend} />
          ) : (
            <p>Select a friend to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
