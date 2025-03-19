import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";
import { Notification } from "../../models/notification";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  // Membaca data sensor dari Firebase dan memeriksa threshold
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

          setNotifications((prevNotifications) => [
            ...newNotifications,
            ...prevNotifications,
          ]);
        }
      });
    }, 5000); // Memeriksa setiap 5 detik

    return () => clearInterval(interval); // Cleanup interval saat komponen unmount
  }, []);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Typography variant="h4">Notifikasi</Typography>
      <Typography variant="subtitle1">
        Daftar notifikasi berdasarkan data sensor
      </Typography>

      {/* TABLE NOTIFICATIONS */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Waktu</TableCell>
              <TableCell align="center">Pesan</TableCell>
              <TableCell align="center">Jenis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{notification.timestamp}</TableCell>
                  <TableCell align="center">{notification.message}</TableCell>
                  <TableCell align="center">{notification.type}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Tidak ada notifikasi.
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