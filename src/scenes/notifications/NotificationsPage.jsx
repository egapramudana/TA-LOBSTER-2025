// src/scenes/notifications/NotificationsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Chip,
  Button,
} from "@mui/material";
import { database } from "../../firebase";
import { ref, onValue, set, query, orderByChild, limitToLast } from "firebase/database";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useLanguage } from "../../contexts/LanguageContext"; // Import hook bahasa

const NOTIFICATION_LIMIT = 99; // Batas maksimum notifikasi

// Function to determine pond condition status
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

// Function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "danger":
      return "#ff3d00"; // Red for danger
    case "warning":
      return "#ffa000"; // Amber for warning
    case "normal":
      return "#4caf50"; // Green for normal
    default:
      return "#757575"; // Grey for unknown
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pondCondition, setPondCondition] = useState("normal");

  const { translate } = useLanguage(); // Gunakan terjemahan

  // Memeriksa apakah browser mendukung notifikasi
  const checkNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("Browser tidak mendukung notifikasi desktop");
      return;
    }
    if (Notification.permission !== "granted") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error("Error meminta izin notifikasi:", error);
      }
    }
  };

  // Mengirim notifikasi desktop
  const sendDesktopNotification = (title, message) => {
    if (Notification.permission === "granted") {
      const notification = new window.Notification(title, {
        body: message,
        icon: "/favicon.ico",
      });
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  };

  // Menghapus notifikasi terlama jika sudah melebihi batas
  const enforceNotificationLimit = async () => {
    const notificationsRef = ref(database, "notifications");
    onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notificationsList = Object.values(data);
        if (notificationsList.length > NOTIFICATION_LIMIT) {
          const sortedNotifications = notificationsList.sort((a, b) => a.createdAt - b.createdAt);
          const deleteCount = notificationsList.length - NOTIFICATION_LIMIT;
          for (let i = 0; i < deleteCount; i++) {
            const oldNotification = sortedNotifications[i];
            const oldNotificationRef = ref(database, `notifications/${oldNotification.id}`);
            set(oldNotificationRef, null);
          }
        }
      }
    }, { onlyOnce: true });
  };

  // Inisialisasi Firebase Cloud Messaging untuk Android
  const initFirebaseMessaging = useCallback(async () => {
    const messaging = getMessaging();
    try {
      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY", // Ganti dengan VAPID Key Anda dari Firebase Console
      });
      if (token) {
        console.log("Token FCM:", token);
      } else {
        console.log("Tidak dapat mendapatkan token FCM.");
      }
      onMessage(messaging, (payload) => {
        console.log("Pesan FCM diterima:", payload);
        const { title, body } = payload.notification;
        sendDesktopNotification(title, body);
      });
    } catch (error) {
      console.error("Error inisialisasi FCM:", error);
    }
  }, []);

  // Membuat notifikasi baru dan menyimpannya ke Firebase
  const createNotification = useCallback((message, type, condition = "normal") => {
    const timestamp = new Date().toLocaleString();
    const id = Date.now().toString();
    const createdAt = Date.now();
    const expiry = createdAt + 24 * 60 * 60 * 1000; // 1 hari dalam milidetik
    const newNotification = {
      id,
      message,
      type,
      timestamp,
      createdAt,
      expiry,
      isRead: false,
      condition
    };
    const notificationsRef = ref(database, `notifications/${id}`);
    set(notificationsRef, newNotification);
    enforceNotificationLimit();
    sendDesktopNotification(`Peringatan ${type}`, message);
    return newNotification;
  }, []);

  // Menghapus notifikasi yang sudah kadaluarsa (lebih dari 1 hari)
  const removeExpiredNotifications = () => {
    const now = Date.now();
    const notificationsRef = ref(database, "notifications");
    onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((key) => {
          if (data[key].expiry < now) {
            const expiredRef = ref(database, `notifications/${key}`);
            set(expiredRef, null);
          }
        });
      }
    }, { onlyOnce: true });
  };

  // Menghapus semua notifikasi
  const clearAllNotifications = () => {
    const notificationsRef = ref(database, "notifications");
    set(notificationsRef, null);
  };

  // Mendapatkan warna chip berdasarkan tipe notifikasi
  const getChipColorByType = (type) => {
    switch (type) {
      case "temperature":
        return "error";
      case "pH":
        return "warning";
      case "waterLevel":
        return "info";
      case "pondStatus":
        return "secondary";
      default:
        return "default";
    }
  };

  // Mendapatkan warna chip berdasarkan kondisi
  const getChipColorByCondition = (condition) => {
    switch (condition) {
      case "danger":
        return "error";
      case "warning":
        return "warning";
      case "normal":
        return "success";
      default:
        return "default";
    }
  };

  // Mendapatkan label chip berdasarkan kondisi
  const getChipLabelByCondition = (condition) => {
    switch (condition) {
      case "danger":
        return translate("condition_danger");
      case "warning":
        return translate("condition_warning");
      case "normal":
        return translate("condition_normal");
      default:
        return "Tidak Diketahui";
    }
  };

  // Membaca data sensor dari Firebase dan setup listener untuk perubahan data
  useEffect(() => {
    checkNotificationPermission();
    initFirebaseMessaging();
    removeExpiredNotifications();

    const expiryInterval = setInterval(removeExpiredNotifications, 60 * 60 * 1000);

    const notificationsRef = query(
      ref(database, "notifications"),
      orderByChild("createdAt"),
      limitToLast(NOTIFICATION_LIMIT)
    );

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notificationsList = Object.values(data)
          .filter(n => n.type === "pondStatus")
          .sort((a, b) => b.createdAt - a.createdAt);
        setNotifications(notificationsList);
        setNotificationCount(notificationsList.length);
        if (notificationsList.length > 0) {
          const latestNotification = notificationsList[0];
          if (latestNotification.condition) {
            setPondCondition(latestNotification.condition);
          }
        }
      } else {
        setNotifications([]);
        setNotificationCount(0);
      }
    });

    const sensorRef = ref(database, "sensor");
    let lastNotificationTime = 0;

    const sensorInterval = setInterval(() => {
      onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const condition = getPondCondition(data.suhu, data.ph, data.tinggi_air);
          setPondCondition(condition);
          const now = Date.now();
          if (now - lastNotificationTime < 10000) return;
          lastNotificationTime = now;

          createNotification(
            `Status Kolam: ${condition === "danger" ? translate("condition_danger") : condition === "warning" ? translate("condition_warning") : translate("condition_normal")}`,
            "pondStatus",
            condition
          );
        }
      }, { onlyOnce: true });
    }, 10000);

    return () => {
      clearInterval(sensorInterval);
      clearInterval(expiryInterval);
      unsubscribe();
    };
  }, [createNotification, initFirebaseMessaging]);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4">{translate("notifications_title")}</Typography>
          <Typography variant="subtitle1">
            {translate("notifications_subtitle")} ({notificationCount}/{NOTIFICATION_LIMIT})
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ 
              backgroundColor: `${getStatusColor(pondCondition)}20`,
              border: `1px solid ${getStatusColor(pondCondition)}`,
              borderRadius: '4px',
              p: 1,
              pl: 2,
              pr: 2
            }}
          >
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: getStatusColor(pondCondition),
                mr: 1
              }} 
            />
            <Typography variant="body2">
              {translate("status_kolam")}: {getChipLabelByCondition(pondCondition)}
            </Typography>
          </Box>

          {notifications.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={clearAllNotifications}
            >
              {translate("clear_all")}
            </Button>
          )}
        </Box>
      </Box>

      {/* TABLE NOTIFICATIONS */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_time")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_message")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_type")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_status")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_condition")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  sx={{
                    backgroundColor: notification.isRead ? "inherit" : "rgba(0, 0, 0, 0.04)",
                    borderLeft: `4px solid ${getStatusColor(notification.condition || "normal")}`,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  <TableCell align="center">{notification.timestamp}</TableCell>
                  <TableCell align="left">{notification.message}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={notification.type}
                      color={getChipColorByType(notification.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={notification.isRead ? translate("status_read") : translate("status_unread")}
                      color={notification.isRead ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getChipLabelByCondition(notification.condition || "normal")}
                      color={getChipColorByCondition(notification.condition || "normal")}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {translate("no_notifications")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default NotificationsPage;