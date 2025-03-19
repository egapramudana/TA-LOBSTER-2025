import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import NotificationsPopover from "../../components/notifpopover";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  return (
    <Box
      display="flex"
      justifyContent="space-between" // Memisahkan elemen kiri dan kanan
      alignItems="center" // Menyelaraskan elemen secara vertikal
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
        <Tooltip title="Toggle Light/Dark Mode">
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon sx={{ color: colors.grey[100] }} />
            ) : (
              <LightModeOutlinedIcon sx={{ color: colors.grey[100] }} />
            )}
          </IconButton>
        </Tooltip>

        {/* NOTIFICATIONS */}
        <NotificationsPopover />

        {/* SETTINGS */}
        <Tooltip title="Settings">
          <IconButton
            sx={{
              "&:hover": {
                backgroundColor: colors.primary[500],
                borderRadius: "50%",
              },
            }}
          >
            <SettingsOutlinedIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Topbar;