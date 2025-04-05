import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../Components/Context/UserContext";
import "./RequestReceiver.css";

function RequestReceiver() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useUser();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${apiUrl}/user/received-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequests(response.data);
      } catch (err) {
        setError("Failed to fetch received requests");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [apiUrl, token]);

  const handleAccept = async (senderId) => {
    try {
      await axios.post(
        `${apiUrl}/user/accept-request`,
        { senderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests((prev) => prev.filter((req) => req._id !== senderId));
    } catch (err) {
      console.error("Failed to accept request", err);
      setError("Failed to accept request");
    }
  };

  const handleDecline = async (senderId) => {
    try {
      await axios.post(
        `${apiUrl}/user/decline-request`,
        { senderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests((prev) => prev.filter((req) => req._id !== senderId));
    } catch (err) {
      console.error("Failed to decline request", err);
      setError("Failed to decline request");
    }
  };

  return (
    <div className="receiverContainer">
      <h3>Friend Requests</h3>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="requestList">
          {requests.length === 0 ? (
            <p>No friend requests received.</p>
          ) : (
            requests.map((request) => (
              <div className="requestCard" key={request._id}>
                <div>
                  <strong>{request.username}</strong>
                  <div>({request.email})</div>
                </div>
                <div className="actions">
                  <button
                    className="acceptBtn"
                    onClick={() => handleAccept(request._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="declineBtn"
                    onClick={() => handleDecline(request._id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default RequestReceiver;
