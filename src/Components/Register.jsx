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

const Register = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    const { username, email, password } = formData;
    if (!username || !email || !password) {
      toast({
        title: "All fields are required.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${apiUrl}/register`, { username, email, password });

      toast({
        title: "Registration successful!",
        description: "Please log in to continue.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      navigate("/login");
    } catch (err) {
      toast({
        title: "Registration failed.",
        description: err.response?.data?.error || "Try again later.",
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
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
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
          onClick={handleRegister}
          isLoading={loading}
          loadingText="Registering..."
        >
          Register
        </Button>

        <Text fontSize="sm" textAlign="center">
          Already have an account?{" "}
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </Text>
      </VStack>
    </Box>
  );
};

export default Register;
