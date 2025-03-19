import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";

const History = () => {
  const [hourlyAverages, setHourlyAverages] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDay, setSelectedDay] = useState("all");

  // Membaca data history dari Firebase
  useEffect(() => {
    const historyRef = ref(database, "history");
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Konversi data ke array
        const dataArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          timestamp: new Date(data[key].timestamp * 1000),
        }));

        // Filter data untuk satu minggu terakhir
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Ambil data 7 hari terakhir
        const filteredByTime = dataArray.filter(
          (item) => item.timestamp >= oneWeekAgo
        );

        // Kelompokkan data berdasarkan jam
        const groupedByHour = {};
        filteredByTime.forEach((item) => {
          const hourKey = `${item.timestamp.getFullYear()}-${item.timestamp.getMonth() + 1}-${item.timestamp.getDate()} ${item.timestamp.getHours()}:00`;
          if (!groupedByHour[hourKey]) {
            groupedByHour[hourKey] = {
              time: hourKey,
              suhu: [],
              ph: [],
              tinggi_air: [],
            };
          }
          groupedByHour[hourKey].suhu.push(item.suhu);
          groupedByHour[hourKey].ph.push(item.ph);
          groupedByHour[hourKey].tinggi_air.push(item.tinggi_air);
        });

        // Hitung rata-rata untuk setiap jam
        const averages = Object.keys(groupedByHour).map((hourKey) => {
          const group = groupedByHour[hourKey];
          return {
            time: group.time,
            suhu: group.suhu.reduce((sum, val) => sum + val, 0) / group.suhu.length || 0,
            ph: group.ph.reduce((sum, val) => sum + val, 0) / group.ph.length || 0,
            tinggi_air: group.tinggi_air.reduce((sum, val) => sum + val, 0) / group.tinggi_air.length || 0,
          };
        });

        // Simpan hasil rata-rata ke state
        setHourlyAverages(averages.reverse()); // Urutkan dari yang terbaru
        setFilteredData(averages.reverse()); // Default: tampilkan semua data
      } else {
        setHourlyAverages([]);
        setFilteredData([]);
      }
    });

    return () => unsubscribe(); // Cleanup listener saat komponen unmount
  }, []);

  // Fungsi untuk menyortir data berdasarkan hari
  const handleDayFilter = (event) => {
    const selected = event.target.value;
    setSelectedDay(selected);

    if (selected === "all") {
      setFilteredData(hourlyAverages); // Tampilkan semua data
    } else {
      const filtered = hourlyAverages.filter((item) => {
        const dayOfWeek = new Date(item.time).getDay(); // Mendapatkan hari dalam seminggu (0-6)
        return dayOfWeek.toString() === selected; // Filter berdasarkan hari yang dipilih
      });
      setFilteredData(filtered); // Filter berdasarkan hari
    }
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Typography variant="h4">Riwayat History</Typography>
      <Typography variant="subtitle1">
        Data Sensor Suhu, pH, dan Ketinggian Air (Rata-Rata Per Jam)
      </Typography>

      {/* FILTER */}
      <Box mt={2}>
        <FormControl fullWidth>
          <InputLabel>Filter Hari</InputLabel>
          <Select value={selectedDay} label="Filter Hari" onChange={handleDayFilter}>
            <MenuItem value="all">Semua Hari</MenuItem>
            <MenuItem value="1">Senin</MenuItem>
            <MenuItem value="2">Selasa</MenuItem>
            <MenuItem value="3">Rabu</MenuItem>
            <MenuItem value="4">Kamis</MenuItem>
            <MenuItem value="5">Jumat</MenuItem>
            <MenuItem value="6">Sabtu</MenuItem>
            <MenuItem value="0">Minggu</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Waktu (Per Jam)</TableCell>
              <TableCell align="center">Suhu (°C)</TableCell>
              <TableCell align="center">pH</TableCell>
              <TableCell align="center">Ketinggian Air (cm)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{row.time}</TableCell>
                  <TableCell align="center">{row.suhu.toFixed(2) || "N/A"}</TableCell>
                  <TableCell align="center">{row.ph.toFixed(2) || "N/A"}</TableCell>
                  <TableCell align="center">{row.tinggi_air.toFixed(2) || "N/A"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Tidak ada data tersedia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default History;