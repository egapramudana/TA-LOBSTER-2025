import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Popover,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import { Notification } from "../models/notification";

const NotificationsPopover = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Fungsi untuk membuka Popover
  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Fungsi untuk menutup Popover
  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  // Membaca data sensor dari Firebase dan memeriksa threshold (setiap 5 detik)
  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const interval = setInterval(() => {
      onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const newNotifications = [];
          if (data.suhu < 20 || data.suhu > 30) {
            newNotifications.push(
              new Notification(
                Date.now(),
                `Suhu: ${data.suhu}°C`,
                "temperature",
                new Date().toLocaleString()
              )
            );
          }
          if (data.ph < 6.5 || data.ph > 7.5) {
            newNotifications.push(
              new Notification(
                Date.now(),
                `pH: ${data.ph}`,
                "pH",
                new Date().toLocaleString()
              )
            );
          }
          if (data.tinggi_air < 1 || data.tinggi_air > 1.5) {
            newNotifications.push(
              new Notification(
                Date.now(),
                `Ketinggian Air: ${data.tinggi_air}m`,
                "waterLevel",
                new Date().toLocaleString()
              )
            );
          }

          // Update state notifications
          setNotifications((prevNotifications) => [
            ...newNotifications,
            ...prevNotifications,
          ]);
        }
      });
    }, 5000); // Memeriksa setiap 5 detik

    return () => clearInterval(interval); // Cleanup interval saat komponen unmount
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "notifications-popover" : undefined;

  return (
    <>
      {/* ICON NOTIFICATIONS */}
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpenNotifications}>
          <NotificationsOutlinedIcon />
        </IconButton>
      </Tooltip>

      {/* POPOVER NOTIFICATIONS */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseNotifications}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          style: {
            width: "300px",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "#1e1e1e", // dark background
            color: "#ffffff", // white text
          },
        }}
      >
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Notifikasi
          </Typography>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
                sx={{
                  backgroundColor: notification.isRead ? "#2c2c2c" : "#3a3a3a",
                  color: "#ffffff",
                  padding: "8px",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#444",
                  },
                }}
              >
                <Typography variant="body1">
                  {notification.message}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1">Tidak ada notifikasi.</Typography>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationsPopover;