import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../Components/Context/UserContext"; // Import useUser context
import "./RequestSender.css"; // Import the external CSS file

function RequestSender() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { token } = useUser();

  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Function to fetch all users
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/user/all-users`, {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token as Bearer token
          },
        });
        setUsers(response.data); // Set the fetched users data
      } catch (err) {
        setError("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false); // Set loading to false once the request is completed
      }
    };

    fetchUsers(); // Call the function to fetch users when the component is mounted
  }, [apiUrl, token]); // Dependency array ensures it runs once when the component mounts

  // Function to send friend request
  const handleSendRequest = async (receiverId) => {
    try {
      setSuccessMessage(""); // Clear any previous success message
      await axios.post(
        `${apiUrl}/user/send-request`,
        { receiverId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token
          },
        }
      );

      setSuccessMessage("Friend request sent successfully!"); // Success message

      // Update the user's status locally
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === receiverId ? { ...user, status: "request_sent" } : user
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to send friend request"
      );
    }
  };

  // Function to unfriend
  const handleUnfriend = async (friendId) => {
    try {
      setSuccessMessage(""); // Clear any previous success message
      await axios.post(
        `${apiUrl}/user/unfriend`,
        { friendId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token
          },
        }
      );

      setSuccessMessage("Unfriended successfully!"); // Success message

      // Update the user's status locally
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === friendId ? { ...user, status: "not_sent" } : user
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to unfriend");
    }
  };

  return (
    <div className="requestContainer">
      <h3>Your Suggestions</h3>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="suggestion">
        {!loading &&
          !error &&
          users.map((user) => (
            <div className="userProfile" key={user._id}>
              <div>
                <strong>{user.username}</strong>
                <div>({user.email})</div>
              </div>
              {user.status === "not_sent" && (
                <button
                  className="sendBtn"
                  onClick={() => handleSendRequest(user._id)}
                >
                  Send Request
                </button>
              )}
              {user.status === "request_sent" && (
                <button className="pendingBtn" disabled>
                  Pending
                </button>
              )}
              {user.status === "friend" && (
                <button
                  className="unfriendBtn"
                  onClick={() => handleUnfriend(user._id)}
                >
                  Unfriend
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default RequestSender;
