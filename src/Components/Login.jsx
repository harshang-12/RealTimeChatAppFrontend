import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Input,
  Button,
  VStack,
  Text,
  useToast,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useUser } from "./Context/UserContext";

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { setToken } = useUser();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    const { username, password } = formData;

    if (!username || !password) {
      toast({
        title: "Please fill in all fields.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${apiUrl}/login`, {
        username,
        password,
      } , { withCredentials: true });

      console.log(response);
      

      setToken(response.data.token);

      toast({
        title: "Login successful!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      navigate("/app/chat/");
    } catch (err) {
      toast({
        title: "Login failed.",
        description: err.response?.data?.error || "Invalid credentials.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="100%">
      <VStack spacing={5} align="stretch">
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            focusBorderColor="blue.400"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            focusBorderColor="blue.400"
          />
        </FormControl>

        <Button
          colorScheme="blue"
          size="md"
          w="100%"
          onClick={handleLogin}
          isLoading={loading}
          loadingText="Logging in..."
        >
          Login
        </Button>

        <Text fontSize="sm" textAlign="center">
          Don't have an account?{" "}
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </Text>
      </VStack>
    </Box>
  );
};

export default Login;
