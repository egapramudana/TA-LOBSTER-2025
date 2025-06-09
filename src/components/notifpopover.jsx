import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Popover,
  Badge,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { database } from "../firebase";
import { ref, onValue, set, query, orderByChild, update, limitToLast } from "firebase/database";

const NOTIFICATION_LIMIT = 99;

// Fungsi untuk menentukan kondisi kolam
const getPondCondition = (tempValue, phValue, waterValue) => {
  const temperatureStatus = tempValue >= 15 && tempValue <= 35 ? "normal" : 
                            (tempValue < 15 || tempValue > 35 ? "danger" : "warning");
  const phStatus = phValue >= 5.5 && phValue <= 8.5 ? "normal" : 
                  (phValue < 5.5 || phValue > 8.5 ? "danger" : "warning");
  const waterLevelStatus = waterValue >= 0.5 && waterValue <= 2 ? "normal" : 
                          (waterValue < 0.5 || waterValue > 2 ? "danger" : "warning");

  if (
    tempValue < 15 || tempValue > 35 ||
    phValue < 5.5 || phValue > 8.5 ||
    waterValue < 0.5 || waterValue > 2
  ) {
    return "danger";
  }
  if (
    temperatureStatus !== "normal" ||
    phStatus !== "normal" ||
    waterLevelStatus !== "normal"
  ) {
    return "warning";
  }
  return "normal";
};

// Fungsi warna status
const getStatusColor = (status) => {
  switch (status) {
    case "danger": return "#ff3d00";
    case "warning": return "#ffa000";
    case "normal": return "#4caf50";
    default: return "#757575";
  }
};

const NotificationsPopover = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pondCondition, setPondCondition] = useState("normal");

  // Minta izin notifikasi desktop
  const checkNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  };

  // Kirim notifikasi desktop
  const sendDesktopNotification = (title, message) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body: message, icon: "/favicon.ico" });
    }
  };

  // Batasi jumlah notifikasi
  const enforceNotificationLimit = () => {
    const notificationsRef = ref(database, "notifications");
    onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val());
        if (data.length > NOTIFICATION_LIMIT) {
          const sorted = data.sort((a, b) => a.createdAt - b.createdAt);
          for (let i = 0; i < data.length - NOTIFICATION_LIMIT; i++) {
            set(ref(database, `notifications/${sorted[i].id}`), null);
          }
        }
      }
    }, { onlyOnce: true });
  };

  // Buat notifikasi pondStatus
  const createNotification = (message, condition = "normal") => {
    const timestamp = new Date().toLocaleString();
    const id = Date.now().toString();
    const createdAt = Date.now();
    const expiry = createdAt + 24 * 60 * 60 * 1000;
    const newNotification = {
      id,
      message,
      type: "pondStatus",
      timestamp,
      createdAt,
      expiry,
      isRead: false,
      condition
    };
    set(ref(database, `notifications/${id}`), newNotification);
    enforceNotificationLimit();
    sendDesktopNotification("Peringatan Kolam", message);
  };

  // Tandai sebagai dibaca
  const markAsRead = (id) => {
    update(ref(database, `notifications/${id}`), { isRead: true });
  };

  const markAllAsRead = () => {
    notifications.forEach(n => !n.isRead && markAsRead(n.id));
  };

  // Buka/tutup popover
  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    markAllAsRead();
  };
  const handleClose = () => setAnchorEl(null);

  // Hapus notifikasi kadaluarsa
  const removeExpired = () => {
    const now = Date.now();
    onValue(ref(database, "notifications"), (snap) => {
      if (snap.exists()) {
        Object.entries(snap.val()).forEach(([key, val]) => {
          if (val.expiry < now) set(ref(database, `notifications/${key}`), null);
        });
      }
    }, { onlyOnce: true });
  };

  // Load notifikasi dari Firebase
  useEffect(() => {
    checkNotificationPermission();
    removeExpired();

    const interval = setInterval(removeExpired, 60 * 60 * 1000);

    const q = query(ref(database, "notifications"), orderByChild("createdAt"), limitToLast(NOTIFICATION_LIMIT));
    const unsubscribe = onValue(q, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.val()).sort((a, b) => b.createdAt - a.createdAt);
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.isRead).length > 99 ? '99+' : list.filter(n => !n.isRead).length);
        if (list[0]?.condition) setPondCondition(list[0].condition);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    const sensorInterval = setInterval(() => {
      onValue(ref(database, "sensor"), (snap) => {
        const data = snap.val();
        if (data) {
          const condition = getPondCondition(data.suhu, data.ph, data.tinggi_air);
          setPondCondition(condition);
          createNotification(
            `Status Kolam: ${condition === "danger" ? "KRITIS" : condition === "warning" ? "Perlu Perhatian" : "Normal"}`,
            condition
          );
        }
      }, { onlyOnce: true });
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(sensorInterval);
      unsubscribe();
    };
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "notifications-popover" : undefined;

  const getBadgeColor = () => {
    switch (pondCondition) {
      case "danger": return "error";
      case "warning": return "warning";
      case "normal": return "success";
      default: return "default";
    }
  };

  return (
    <>
      {/* ICON NOTIFIKASI */}
      <Tooltip title="Notifikasi">
        <IconButton onClick={handleOpen}>
          <Badge badgeContent={unreadCount} color={getBadgeColor()}>
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* POPOVER CONTENT */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          style: {
            width: "300px",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
          },
        }}
      >
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Notifikasi</Typography>
            {notifications.length > 0 && (
              <Typography
                variant="caption"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => set(ref(database, "notifications"), null)}
              >
                Hapus semua
              </Typography>
            )}
          </Box>

          {/* Status Kolam */}
          <Box
            mb={2}
            p={1}
            sx={{
              backgroundColor: `${getStatusColor(pondCondition)}20`,
              border: `1px solid ${getStatusColor(pondCondition)}`,
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: getStatusColor(pondCondition),
                mr: 1,
              }}
            />
            <Typography variant="body2">
              {pondCondition === "normal"
                ? "Kondisi kolam normal"
                : pondCondition === "warning"
                ? "Kondisi kolam memerlukan perhatian"
                : "Kondisi kolam KRITIS!"}
            </Typography>
          </Box>

          {/* Daftar Notifikasi */}
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <Box
                key={notif.id}
                display="flex"
                flexDirection="column"
                mb={1}
                sx={{
                  backgroundColor: notif.isRead ? "#2c2c2c" : "#3a3a3a",
                  color: "#fff",
                  padding: "8px",
                  borderRadius: "4px",
                  borderLeft: `4px solid ${getStatusColor(notif.condition)}`,
                  "&:hover": { backgroundColor: "#444" },
                }}
                onClick={() => markAsRead(notif.id)}
              >
                <Typography variant="body2">{notif.message}</Typography>
                <Typography variant="caption" color="gray">
                  {notif.timestamp} • {notif.type}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>Tidak ada notifikasi.</Typography>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationsPopover;