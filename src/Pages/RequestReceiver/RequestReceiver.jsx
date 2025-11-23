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

function RequestReceiver() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useUser();
  const apiUrl = import.meta.env.VITE_API_URL;
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderCol = useColorModeValue("gray.200", "gray.700");

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
  useEffect(() => {

    fetchRequests();
  }, [apiUrl, token]);

  const handleAccept = async (senderId) => {
    try {
      await axios.post(
        `${apiUrl}/user/accept-request`,
        { senderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests((prev) => prev.filter((req) => req.sender._id !== senderId));
      toast({
        title: "Friend request accepted!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Failed to accept request", err);
      toast({
        title: "Failed to accept request",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDecline = async (senderId) => {
    try {
      await axios.post(
        `${apiUrl}/user/decline-request`,
        { senderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests((prev) => prev.filter((req) => req.sender._id !== senderId));
      toast({
        title: "Friend request declined",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Failed to decline request", err);
      toast({
        title: "Failed to decline request",
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
        Friend Requests
      </Heading>

      {loading ? (
        <Flex justify="center" align="center" h="60vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Text color="red.500" textAlign="center">
          {error}
        </Text>
      ) : requests.length === 0 ? (
        <Text color="gray.500" textAlign="center">
          No friend requests received.
        </Text>
      ) : (
        <VStack spacing={4} align="stretch" maxW="600px" mx="auto">
          {requests.map((request) => (
            <Flex
              key={request.sender._id}
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
                <Text fontWeight="bold">{request.sender.username}</Text>
                <Text fontSize="sm" color="gray.500">
                  {request.sender.email}
                </Text>
              </Box>

              <HStack spacing={3}>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => handleAccept(request.sender._id)}
                >
                  Accept
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(request.sender._id)}
                >
                  Decline
                </Button>
              </HStack>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default RequestReceiver;
