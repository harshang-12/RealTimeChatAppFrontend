// Login.js
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./Context/UserContext";
// import './styles.css'; // Import the CSS file

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { setToken } = useUser();

  const handleLogin = async () => {
    try {
      setError("");
      const response = await axios.post(`${apiUrl}/login`, {
        username,
        password,
      });
      console.log("response :", response.data);
      //   setUser(response.data); // Save user to state
      setToken(response.data.token);
      alert("Login successful!");
      navigate("/app/chat/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Login failed. Check your credentials."
      );
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleLogin}>Login</button>

      <Link to={`/register`}>register</Link>
    </div>
  );
};

export default Login;
