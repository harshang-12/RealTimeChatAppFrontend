import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  VStack,
  Text,
  Heading,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  IconButton,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useUser } from "../../Components/Context/UserContext";
import axios from "axios";
import Messages from "./Messages";

function Chat() {
  const { user, token, setIschatsection, ischatsection } = useUser();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const bgSidebar = useColorModeValue("white", "gray.800");
  const bgChat = useColorModeValue("gray.100", "gray.900");

  /** Fetch friends */
  const fetchFriends = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/user/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl]);

  /** Filtered friends */
  const filteredFriends = useMemo(
    () =>
      friends.filter((f) =>
        f.username.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, friends]
  );

  /** Select friend */
  const handleFriendClick = useCallback((friend) => {
    setIschatsection(true);
    setSelectedFriend(friend);
  }, [setIschatsection]);

  /** Back (mobile) */
  const handleBackToList = useCallback(() => {
    setIschatsection(false);
    setSelectedFriend(null);
  }, [setIschatsection]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends, user]);

  return (
    <Flex
      h={{ base: ischatsection ? "100vh" : "calc(100vh - 64px)", md: "100vh" }}
      bg={bgChat}
      overflow="hidden"
    >
      {/* Sidebar */}
      <Box
        w={{ base: "100%", lg: "300px" }}
        bg={bgSidebar}
        p={4}
        borderRight={{ md: "1px solid" }}
        borderColor="gray.200"
        overflowY="auto"
        display={{ base: selectedFriend ? "none" : "block", lg: "block" }}
      >
        <Heading size="md" mb={3} color="blue.600">
          Friends
        </Heading>

        <InputGroup mb={3}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search friend..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="lg"
            bg="gray.50"
            _focus={{ borderColor: "blue.400", bg: "white" }}
          />
        </InputGroup>

        {loading ? (
          <Flex justify="center" mt={10}>
            <Spinner size="lg" color="blue.500" />
          </Flex>
        ) : filteredFriends.length ? (
          <VStack align="stretch" spacing={2}>
            {filteredFriends.map((friend) => (
              <Flex
                key={friend._id}
                align="center"
                p={3}
                borderRadius="md"
                bg={selectedFriend?._id === friend._id ? "blue.50" : "transparent"}
                _hover={{ bg: "blue.100", cursor: "pointer" }}
                onClick={() => handleFriendClick(friend)}
              >
                <Avatar
                  name={friend.username}
                  size="sm"
                  mr={3}
                  bg="blue.400"
                  color="white"
                />
                <Text fontWeight="medium">{friend.username}</Text>
              </Flex>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500" textAlign="center" mt={5}>
            No friends available
          </Text>
        )}
      </Box>

      {/* Chat Window */}
      <Flex
        flex="1"
        direction="column"
        bg="white"
        p={1}
        overflow="hidden"
        borderLeft={{ base: "none", lg: "1px solid" }}
        borderColor="gray.200"
        display={{ base: selectedFriend ? "flex" : "none", lg: "flex" }}
      >
        {!selectedFriend ? (
          <Flex flex="1" align="center" justify="center">
            <Text color="gray.500" fontSize="lg">
              Select a friend to start chatting 💬
            </Text>
          </Flex>
        ) : (
          <>
            {/* Header */}
            <Flex
              align="center"
              justify="space-between"
              mb={3}
              borderBottom="1px solid"
              borderColor="gray.200"
              pb={2}
            >
              <HStack>
                <IconButton
                  icon={<ArrowBackIcon />}
                  aria-label="Back"
                  display={{ base: "flex", lg: "none" }}
                  onClick={handleBackToList}
                  mr={2}
                />
                <Avatar
                  name={selectedFriend.username}
                  size="sm"
                  bg="blue.500"
                  color="white"
                />
                <Heading size="sm" color="blue.600">
                  {selectedFriend.username}
                </Heading>
              </HStack>
            </Flex>

            {/* Messages */}
            <Box flex="1" overflowY="auto">
              <Messages selectedFriend={selectedFriend} />
            </Box>
          </>
        )}
      </Flex>
    </Flex>
  );
}

export default Chat;
