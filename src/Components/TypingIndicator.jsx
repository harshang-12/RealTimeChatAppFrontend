// TypingIndicator.jsx
import React from "react";
import { Box, HStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react"; // <- correct source for keyframes

const bounce = keyframes`
  0% { transform: translateY(0); opacity: 0.35; }
  25% { transform: translateY(-4px); opacity: 1; }
  50% { transform: translateY(0); opacity: 0.35; }
  100% { transform: translateY(0); opacity: 0.35; }
`;

const TypingDot = ({ delay = "0s" }) => (
  <Box
    w="7px"
    h="7px"
    borderRadius="full"
    bg="gray.600"
    opacity={0.35}
    animation={`${bounce} 1s ${delay} infinite ease-in-out`}
  />
);

const TypingIndicator = () => {
  return (
    <Box
      bg="gray.200"
      px={3}
      py={2}
      borderRadius="lg"
      maxW="fit-content"
      display="flex"
      alignItems="center"
      boxShadow="sm"
    >
      <HStack spacing="6px">
        <TypingDot delay="0s" />
        <TypingDot delay="0.15s" />
        <TypingDot delay="0.3s" />
      </HStack>
    </Box>
  );
};

export default TypingIndicator;
