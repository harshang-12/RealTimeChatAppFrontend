import React from "react";
import {
  Box,
  Flex,
  Heading,
  useColorModeValue,
  VStack,
  Text,
} from "@chakra-ui/react";

const AuthLayout = ({ children }) => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      minH="100vh"
      align="center"
      justify="center"
      bgGradient={useColorModeValue(
        "linear(to-r, blue.100, blue.300)",
        "linear(to-r, blue.700, blue.900)"
      )}
      p={{ base: 4, sm: 6 }}
    >
      <Box
        w={{ base: "100%", sm: "90%", md: "400px" }}
        bg={cardBg}
        p={{ base: 6, sm: 8 }}
        rounded="2xl"
        boxShadow="2xl"
        border="1px solid"
        borderColor={borderColor}
        mx="auto"
      >
        <VStack spacing={6}>
          <Heading
            as="h2"
            size={{ base: "lg", sm: "xl" }}
            textAlign="center"
            color="blue.500"
          >
            Welcome 👋
          </Heading>
          <Text
            fontSize={{ base: "sm", sm: "md" }}
            textAlign="center"
            color={useColorModeValue("gray.600", "gray.300")}
          >
            Please log in or create your account
          </Text>

          <Box w="100%">{children}</Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AuthLayout;
