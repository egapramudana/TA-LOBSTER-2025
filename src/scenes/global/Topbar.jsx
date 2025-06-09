// src/scenes/global/Topbar.jsx
import { Box, IconButton, Tooltip, useTheme, Menu, MenuItem } from "@mui/material";
import NotificationsPopover from "../../components/notifpopover";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import TranslateIcon from "@mui/icons-material/Translate"; // Import icon untuk translator
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { auth } from "../../firebase";
import { useLanguage } from "../../contexts/LanguageContext"; // Import useLanguage hook

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { translate, changeLanguage, language } = useLanguage(); // Menggunakan hook useLanguage
  
  // State untuk menu bahasa
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Membuka menu bahasa
  const handleLanguageClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Menutup menu bahasa
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      sx={{
        flexWrap: "wrap",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* ELEMEN KIRI - KOSONG */}
      <Box />

      {/* ELEMEN KANAN - IKON */}
      <Box display="flex" alignItems="center">
        {/* TOGGLE LIGHT/DARK MODE */}
        <Tooltip title={translate("toggle_theme")}>
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon sx={{ color: colors.grey[100] }} />
            ) : (
              <LightModeOutlinedIcon sx={{ color: colors.grey[100] }} />
            )}
          </IconButton>
        </Tooltip>

        {/* LANGUAGE SELECTOR */}
        <Tooltip title={translate("change_language")}>
          <IconButton
            onClick={handleLanguageClick}
            sx={{
              "&:hover": {
                backgroundColor: colors.primary[500],
                borderRadius: "50%",
              },
              // Ganti warna background jika aktif
              backgroundColor: open ? colors.primary[500] : "transparent", 
            }}
          >
            <TranslateIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Tooltip>
        
        {/* LANGUAGE MENU */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              backgroundColor: colors.primary[400],
              color: colors.grey[100],
            },
          }}
        >
          <MenuItem 
            onClick={() => {
              changeLanguage("en");
              handleClose();
            }}
            sx={{ 
              backgroundColor: language === "en" ? colors.primary[600] : "transparent",
              "&:hover": { backgroundColor: colors.primary[500] }
            }}
          >
            English
          </MenuItem>
          <MenuItem 
            onClick={() => {
              changeLanguage("id");
              handleClose();
            }}
            sx={{ 
              backgroundColor: language === "id" ? colors.primary[600] : "transparent",
              "&:hover": { backgroundColor: colors.primary[500] }
            }}
          >
            Bahasa Indonesia
          </MenuItem>
        </Menu>

        {/* NOTIFICATIONS */}
        <NotificationsPopover />

        {/* LOGOUT BUTTON */}
        <Tooltip title={translate("logout")}>
          <IconButton
            onClick={handleLogout}
            sx={{
              "&:hover": {
                backgroundColor: colors.redAccent[500],
                borderRadius: "50%",
              },
            }}
          >
            <LogoutOutlinedIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Topbar;