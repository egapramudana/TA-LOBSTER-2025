// src/scenes/history/index.jsx
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
import { useLanguage } from "../../contexts/LanguageContext"; // Import hook bahasa

const History = () => {
  const [hourlyAverages, setHourlyAverages] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDay, setSelectedDay] = useState("all");
  const { translate } = useLanguage(); // Gunakan terjemahan

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
            time: hourKey,
            suhu: group.suhu.reduce((sum, val) => sum + val, 0) / group.suhu.length || 0,
            ph: group.ph.reduce((sum, val) => sum + val, 0) / group.ph.length || 0,
            tinggi_air:
              group.tinggi_air.reduce((sum, val) => sum + val, 0) / group.tinggi_air.length || 0,
          };
        });

        // Simpan hasil rata-rata ke state
        setHourlyAverages(averages.reverse()); // Urutkan dari yang terbaru
        setFilteredData(averages.reverse());
      } else {
        setHourlyAverages([]);
        setFilteredData([]);
      }
    });

    return () => unsubscribe(); // Cleanup saat komponen unmount
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
      setFilteredData(filtered);
    }
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Typography variant="h4">{translate("history_title")}</Typography>
      <Typography variant="subtitle1">{translate("history_subtitle")}</Typography>

      {/* FILTER */}
      <Box mt={2}>
        <FormControl fullWidth>
          <InputLabel>{translate("filter_label")}</InputLabel>
          <Select
            value={selectedDay}
            label={translate("filter_label")}
            onChange={handleDayFilter}
          >
            <MenuItem value="all">{translate("filter_all_days")}</MenuItem>
            <MenuItem value="1">{translate("filter_monday")}</MenuItem>
            <MenuItem value="2">{translate("filter_tuesday")}</MenuItem>
            <MenuItem value="3">{translate("filter_wednesday")}</MenuItem>
            <MenuItem value="4">{translate("filter_thursday")}</MenuItem>
            <MenuItem value="5">{translate("filter_friday")}</MenuItem>
            <MenuItem value="6">{translate("filter_saturday")}</MenuItem>
            <MenuItem value="0">{translate("filter_sunday")}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_time")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_temperature")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_ph")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {translate("table_water_level")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{row.time}</TableCell>
                  <TableCell align="center">{row.suhu.toFixed(2)}</TableCell>
                  <TableCell align="center">{row.ph.toFixed(2)}</TableCell>
                  <TableCell align="center">{row.tinggi_air.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {translate("no_data")}
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