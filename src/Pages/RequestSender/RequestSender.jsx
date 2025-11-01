import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Spinner,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { useUser } from "../../Components/Context/UserContext";

function RequestSender() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useUser();
  const apiUrl = import.meta.env.VITE_API_URL;
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderCol = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/user/all-users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiUrl, token]);

  const handleSendRequest = async (receiverId) => {
    try {
      await axios.post(
        `${apiUrl}/user/send-request`,
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === receiverId ? { ...u, status: "request_sent" } : u
        )
      );

      toast({
        title: "Friend request sent!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Failed to send request",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleUnfriend = async (friendId) => {
    try {
      await axios.post(
        `${apiUrl}/user/remove-friend`,
        { friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === friendId ? { ...u, status: "not_sent" } : u
        )
      );

      toast({
        title: "Removed friend successfully!",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Failed to unfriend",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg={useColorModeValue("gray.50", "gray.900")}
      minH="100vh"
    >
      <Heading size="lg" mb={6} color="blue.600" textAlign="center">
        User Suggestions
      </Heading>

      {loading ? (
        <Flex justify="center" align="center" h="60vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Text color="red.500" textAlign="center">
          {error}
        </Text>
      ) : users.length === 0 ? (
        <Text color="gray.500" textAlign="center">
          No users available.
        </Text>
      ) : (
        <VStack spacing={4} align="stretch" maxW="700px" mx="auto">
          {users.map((user) => (
            <Flex
              key={user._id}
              p={4}
              border="1px solid"
              borderColor={borderCol}
              borderRadius="lg"
              bg={cardBg}
              justify="space-between"
              align="center"
              boxShadow="sm"
              _hover={{ boxShadow: "md" }}
            >
              <Box>
                <Text fontWeight="bold" fontSize="md">
                  {user.username}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {user.email}
                </Text>
              </Box>

              <HStack spacing={3}>
                {user.status === "not_sent" && (
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => handleSendRequest(user._id)}
                  >
                    Send Request
                  </Button>
                )}

                {user.status === "request_sent" && (
                  <Button colorScheme="gray" size="sm" disabled>
                    Pending
                  </Button>
                )}

                {user.status === "friend" && (
                  <Button
                    colorScheme="red"
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnfriend(user._id)}
                  >
                    Unfriend
                  </Button>
                )}
              </HStack>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default RequestSender;
