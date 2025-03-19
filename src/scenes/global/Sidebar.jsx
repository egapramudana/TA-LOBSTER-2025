import { useState, useEffect, useRef } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Switch, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ScienceIcon from '@mui/icons-material/Science';
import WavesIcon from '@mui/icons-material/Waves';
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import NotificationsPage from "../notifications/NotificationsPage";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CopyrightIcon from '@mui/icons-material/Copyright';
import { database } from "../../firebase";
import { ref, onValue, update } from "firebase/database";

const Item = ({ title, to, icon, selected, setSelected, isCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const titleText = typeof title === 'string' ? title : 'Menu Item';
  return (
    <MenuItem
      active={selected === titleText}
      style={{
        color: colors.grey[100],
        padding: isCollapsed ? "5px 0" : undefined,
        display: "flex",
        justifyContent: isCollapsed ? "center" : "flex-start",
        alignItems: "center",
        marginBottom: isCollapsed ? "10px" : "5px",
      }}
      onClick={() => setSelected(titleText)}
      icon={icon}
    >
      {!isCollapsed && (
        <>
          {typeof title === 'string' ? (
            <Typography 
              sx={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.2",
                fontSize: "0.9rem",
              }}
            >
              {title}
            </Typography>
          ) : (
            title
          )}
        </>
      )}
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [selected, setSelected] = useState("Beranda");
  const [mode, setMode] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const controlRef = ref(database, "control/mode");
    const unsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      setMode(data !== null ? data : false);
    });
    return () => unsubscribe();
  }, []);

  const handleModeChange = (event) => {
    const newMode = event.target.checked;
    setMode(newMode);
    const controlRef = ref(database, "control");
    update(controlRef, { mode: newMode });
  };

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    } else {
      setIsCollapsed(isMobile);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const SectionDivider = () => {
    if (!isCollapsed) return null;
    return (
      <Box 
        sx={{
          height: "1px",
          width: "60%",
          backgroundColor: colors.grey[500],
          opacity: 0.5,
          margin: "10px auto",
        }}
      />
    );
  };

  const SectionHeading = ({ title }) => (
    <Typography
      variant="h6"
      color={colors.grey[300]}
      sx={{
        m: "15px 0 8px 20px",
        fontSize: "0.85rem",
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {title}
    </Typography>
  );

  // Improved Swipe Logic
  useEffect(() => {
    let startX = 0;
    let isSwiping = false;
    const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger sidebar
    const EDGE_THRESHOLD = 30; // Pixels from edge to detect swipe

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      
      // Only initiate swipe detection if touch starts near the edge of the screen
      if (isCollapsed && startX < EDGE_THRESHOLD) {
        isSwiping = true;
      } else if (!isCollapsed && startX < (isCollapsed ? 80 : 300) + EDGE_THRESHOLD) {
        isSwiping = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;

      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;

      // Open sidebar if swiping right from left edge when collapsed
      if (deltaX > SWIPE_THRESHOLD && isCollapsed) {
        setIsCollapsed(false);
        localStorage.setItem('sidebarCollapsed', 'false');
        isSwiping = false;
      }

      // Close sidebar if swiping left when open
      if (deltaX < -SWIPE_THRESHOLD && !isCollapsed) {
        setIsCollapsed(true);
        localStorage.setItem('sidebarCollapsed', 'true');
        isSwiping = false;
      }
    };

    const handleTouchEnd = () => {
      isSwiping = false;
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isCollapsed]);

  return (
    <Box
      ref={sidebarRef}
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
          display: "flex",
          justifyContent: isCollapsed ? "center" : "flex-start",
          width: isCollapsed ? "100%" : "auto",
          minWidth: isCollapsed ? "unset" : "auto",
          margin: isCollapsed ? "0 auto" : "0px",
        },
        "& .pro-inner-item": {
          padding: isCollapsed ? "8px 0 !important" : "5px 20px 5px 15px !important",
          transition: "all 0.2s ease-in-out",
          justifyContent: isCollapsed ? "center" : "flex-start",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
          backgroundColor: `${colors.primary[500]} !important`,
          borderRadius: "4px",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
          backgroundColor: `${colors.primary[500]} !important`,
          borderRadius: "4px",
        },
        "& .pro-sidebar": {
          width: isCollapsed ? "80px !important" : "300px !important",
          minWidth: isCollapsed ? "80px !important" : "300px !important",
          transition: "width 0.3s ease-in-out",
        },
        "& .pro-sidebar.collapsed": {
          width: "60px !important",
          minWidth: "60px !important",
        },
        height: "100vh",
        position: "fixed",
        top: 0,
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={toggleSidebar}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0px 15px 0",
              marginLeft: "12px",
              color: colors.grey[100],
              justifyContent: isCollapsed ? "center" : "flex-start",
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginLeft="10px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  LOBS
                </Typography>
                <IconButton onClick={toggleSidebar}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="20px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="80px"
                  height="80px"
                  src={`../../assets/user.png`}
                  style={{ 
                    cursor: "pointer", 
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${colors.greenAccent[500]}`,
                  }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "8px 0 0 0", fontSize: "1.5rem" }}
                >
                  Lobster
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]} sx={{ fontSize: "0.85rem" }}>
                  Monitoring & Control
                </Typography>
              </Box>
            </Box>
          )}

          {isCollapsed && (
            <Box mb="20px" display="flex" justifyContent="center">
              <img
                alt="logo"
                width="40px"
                height="40px"
                src={`../../assets/user.png`}
                style={{ 
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `2px solid ${colors.greenAccent[500]}`,
                }}
              />
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "5%"}>  
            <Item
              title="Beranda"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />

            {!isCollapsed && <SectionHeading title="Monitor" />}
            {isCollapsed && <SectionDivider />}
            <Item
              title="Suhu Air (°C)"
              to="/monitoring-suhu"
              icon={<AcUnitIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title="Keasaman Air (pH)"
              to="/monitoring-ph"
              icon={<ScienceIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title="Ketinggian Air (cm)"
              to="/water-level"
              icon={<WavesIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />

            {!isCollapsed && <SectionHeading title="Control" />}
            
            {isCollapsed && <SectionDivider />}
            
            {!isCollapsed && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mx: "15px", my: "8px" }}
              >
                <Typography variant="body2" color={colors.grey[100]}>
                  Mode Otomatis
                </Typography>
                <Switch
                  checked={mode}
                  onChange={handleModeChange}
                  color="success"
                  size="small"
                  sx={{
                    "& .MuiSwitch-thumb": {
                      backgroundColor: mode ? colors.greenAccent[600] : colors.grey[500],
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: mode ? colors.greenAccent[600] : colors.grey[500],
                    },
                  }}
                />
              </Box>
            )}
            <Item
              title="Kontrol Suhu Air (°C)"
              to="/control-suhu"
              icon={<DeviceThermostatIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title="Kontrol Ketinggian Air (cm)"
              to="/control-water-level"
              icon={<OpacityIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            
            {!isCollapsed && <SectionHeading title="Info" />}
            {isCollapsed && <SectionDivider />}
            <Item
              title="Notifikasi"
              to="/notifications"
              icon={<NotificationsIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title="Kalender & Riwayat"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title="Status Alat"
              to="/status-alat"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
            <Item
              title="Riwayat History"
              to="/history"
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />
          </Box>
          <Box
            sx={{
              color: colors.greenAccent[500],
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              px: isCollapsed ? 0 : 2,
              py: 3,
              fontSize: "0.75rem",
              transition: "all 0.2s ease-in-out",
              ...(isCollapsed && { flexDirection: "column", textAlign: "center" })
            }}
          >
            {isCollapsed ? (
              <CopyrightIcon sx={{ fontSize: "1rem", mb: 0.5, mr: 1.3 }} />
            ) : (
              <CopyrightIcon sx={{ mr: 1, ml:5 , fontSize: "1.1rem" }} />
            )}
            {!isCollapsed && (
              <Typography variant="caption">
                Copyright 2025 Kelompok S2TK14
              </Typography>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;