import { NotificationsPage } from "./pages/NotificationsPage";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4f46e5", // Indigo
    },
    background: {
      default: "#f8fafc",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <NotificationsPage />
      </Box>
    </ThemeProvider>
  );
}