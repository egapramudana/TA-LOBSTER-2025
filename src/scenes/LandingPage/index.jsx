// src/scenes/LandingPage.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { auth, provider } from "../../firebase";
import { ALLOWED_EMAILS } from "../../components/auth/whitelist";
import { signInWithPopup } from "firebase/auth";
import GoogleIcon from "@mui/icons-material/Google";

const LandingPage = ({ setUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    try {
      // Trigger Google login popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user's email is in the whitelist
      if (ALLOWED_EMAILS.includes(user.email)) {
        console.log("User logged in:", user.email);
        setUser(user); // Allow access
      } else {
        console.error("Unauthorized email:", user.email);

        // Sign out the unauthorized user
        await auth.signOut();

        // Set error message to display on the landing page
        setError("Your email is not authorized to access this app.");
      }
    } catch (err) {
      console.error("Error during Google login:", err.message);

      // Handle other errors (e.g., network issues)
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      {/* Background image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(/assets/lobster.jpeg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />

      {/* Semi-transparent overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          zIndex: 1,
        }}
      />

      {/* Foreground content */}
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <Paper
          elevation={10}
          sx={{
            p: 5,
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#333333" }}
          >
            🦞 THE LOBS
          </Typography>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ color: "#555555" }}
          >
            Monitor and control your lobster farming system effortlessly.
          </Typography>

          {/* Custom Error Box */}
          {error && (
            <Box
              sx={{
                backgroundColor: "#f44336", // Red background
                color: "#fff", // White text
                padding: "10px",
                borderRadius: "5px",
                mt: 2,
                mb: 2,
                textAlign: "center",
              }}
            >
              {error}
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            sx={{
              mt: 4,
              backgroundColor: colors.greenAccent[600],
              color: "#fff",
              "&:hover": {
                backgroundColor: colors.greenAccent[700],
              },
              borderRadius: "30px",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
            }}
            onClick={handleGoogleLogin}
          >
            Login with Google
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;