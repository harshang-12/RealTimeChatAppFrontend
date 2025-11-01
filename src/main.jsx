import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./Components/Context/UserContext.jsx";
import axios from "axios";

axios.defaults.withCredentials = true;


// 💙 Custom theme configuration
const theme = extendTheme({
  config: {
    initialColorMode: "light", // or "dark"
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#e3f2ff",
      100: "#b3d4ff",
      200: "#81b6ff",
      300: "#4f97ff",
      400: "#1d79ff",
      500: "#035fe6", // main blue shade
      600: "#0049b4",
      700: "#003382",
      800: "#001d51",
      900: "#000721",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === "brand" ? "brand.500" : undefined,
          _hover: {
            bg: props.colorScheme === "brand" ? "brand.600" : undefined,
          },
        }),
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <UserProvider>
        <App />
      </UserProvider>
    </ChakraProvider>
  </StrictMode>
);
