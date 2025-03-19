import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Switch,
} from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat"; // For Temperature
import ScienceIcon from "@mui/icons-material/Science"; // For pH Level
import OpacityIcon from "@mui/icons-material/Opacity"; // For Water Level
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"; // For Low Status
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // For High Status
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule"; // For Normal Status
import Header from "../../components/Header";
import GrafikSuhu from "../../components/grafiksuhu";
import GrafikPH from "../../components/GrafikPH";
import GrafikWaterLevel from "../../components/GrafikWaterLevel";
import { database } from "../../firebase";
import { ref, onValue, update } from "firebase/database";
import { tokens } from "../../theme";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State untuk menyimpan data sensor
  const [sensorData, setSensorData] = useState([]);
  // State untuk mode otomatis
  const [mode, setMode] = useState(false);

  // Sinkronisasi mode otomatis dengan Firebase
  useEffect(() => {
    const controlRef = ref(database, "control/mode");
    const unsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      setMode(data !== null ? data : false); // Fallback ke false jika data null
    });
    return () => unsubscribe(); // Cleanup listener saat komponen unmount
  }, []);

  // Fungsi untuk memperbarui mode otomatis di Firebase
  const handleModeChange = (event) => {
    const newMode = event.target.checked;
    setMode(newMode); // Update state lokal
    const controlRef = ref(database, "control");
    update(controlRef, { mode: newMode }); // Update nilai mode di Firebase
  };

  // Fungsi untuk mendapatkan status berdasarkan threshold
  const getStatus = (value, type) => {
    if (type === "temperature") {
      return value < 20 ? "Rendah" : value > 30 ? "Tinggi" : "Normal";
    } else if (type === "pH") {
      return value < 6.5 ? "Rendah" : value > 7.5 ? "Tinggi" : "Normal";
    } else if (type === "waterLevel") {
      return value < 1 ? "Rendah" : value > 1.5 ? "Tinggi" : "Normal";
    }
  };

  // Fungsi untuk mendapatkan ikon dan label status
  const getIconAndLabel = (status) => {
    switch (status) {
      case "Rendah":
        return { icon: <ArrowDownwardIcon />, label: "Rendah" };
      case "Tinggi":
        return { icon: <ArrowUpwardIcon />, label: "Tinggi" };
      default:
        return { icon: <HorizontalRuleIcon />, label: "Normal" };
    }
  };

  // Membaca data sensor dari Firebase
  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Konversi timestamp Firebase ke format tanggal dan waktu lokal
        const readableTimestamp = new Date(data.timestamp * 1000).toLocaleString();

        setSensorData((prevData) => {
          const newData = [
            ...prevData,
            {
              time: readableTimestamp, // Menggunakan timestamp yang sudah dikonversi
              temperature: data.suhu || 0,
              pH: data.ph || 0,
              waterLevel: data.tinggi_air || 0,
            },
          ];
          return newData.slice(-20); // Batasi jumlah entri menjadi 20
        });
      }
    });
    return () => unsubscribe(); // Cleanup listener saat komponen unmount
  }, []);

  const latestData = sensorData[sensorData.length - 1] || {
    temperature: 0,
    pH: 0,
    waterLevel: 0,
  };

  const temperatureStatus = getStatus(latestData.temperature, "temperature");
  const phStatus = getStatus(latestData.pH, "pH");
  const waterLevelStatus = getStatus(latestData.waterLevel, "waterLevel");

  const temperatureIconLabel = getIconAndLabel(temperatureStatus);
  const phIconLabel = getIconAndLabel(phStatus);
  const waterLevelIconLabel = getIconAndLabel(waterLevelStatus);

  // Adjust the number of data points based on screen size
  const dataPointsToShow = isMobile ? 3 : 5;
  const filteredData = sensorData.slice(-dataPointsToShow);

  const temperatureData = [
    {
      id: "Suhu",
      color: "hsl(0, 70%, 50%)",
      data: filteredData.map((entry) => ({
        x: entry.time,
        y: Math.round(entry.temperature),
      })),
    },
  ];

  const phData = [
    {
      id: "pH",
      color: "hsl(120, 70%, 50%)",
      data: filteredData.map((entry) => ({
        x: entry.time,
        y: Math.round(entry.pH),
      })),
    },
  ];

  const waterLevelData = [
    {
      id: "Ketinggian Air",
      color: "hsl(240, 70%, 50%)",
      data: filteredData.map((entry) => ({
        x: entry.time,
        y: Math.round(entry.waterLevel * 10) / 10,
      })),
    },
  ];

  return (
    <Box m="10px" sx={{ overflowX: "hidden" }}>
      {/* HEADER */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap="10px"
        sx={{
          ml: { xs: 0, sm: 3 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Header title="Beranda" subtitle="Selamat Datang di The LOBS" />
        {/* Mode Otomatis */}
        <Box display="flex" alignItems="center">
          <Typography variant="body1" color={colors.grey[100]} mr={2}>
            Mode Otomatis
          </Typography>
          <Switch
            checked={mode}
            onChange={handleModeChange}
            color="success"
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
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(12, 1fr)",
        }}
        gridAutoRows="auto"
        gap="20px"
        sx={{ padding: { xs: "10px", sm: "20px" } }}
      >
        {/* ROW 1 - Statistik Sensor */}
        <Box
          gridColumn={{ xs: "span 1", sm: "span 1", md: "span 4" }}
          backgroundColor={colors.primary[400]}
          sx={{
            padding: "15px",
            borderRadius: "8px",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: { xs: "none", sm: "scale(1.05)" },
              boxShadow: { xs: "none", sm: `0 4px 8px rgba(0, 0, 0, 0.2)` },
            },
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h3" fontWeight="bold" color={colors.grey[100]}>
                {`${latestData.temperature}°C`}
              </Typography>
              <Typography variant="h5" color={colors.greenAccent[500]}>
                Temperature
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ThermostatIcon
                sx={{ color: colors.greenAccent[600], fontSize: "24px" }}
              />
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt="10px">
            {temperatureIconLabel.icon}
            <Typography variant="body2" color={colors.grey[300]} ml="5px">
              {temperatureIconLabel.label}
            </Typography>
          </Box>
        </Box>

        <Box
          gridColumn={{ xs: "span 1", sm: "span 1", md: "span 4" }}
          backgroundColor={colors.primary[400]}
          sx={{
            padding: "15px",
            borderRadius: "8px",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: { xs: "none", sm: "scale(1.05)" },
              boxShadow: { xs: "none", sm: `0 4px 8px rgba(0, 0, 0, 0.2)` },
            },
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h3" fontWeight="bold" color={colors.grey[100]}>
                {`${latestData.pH}`}
              </Typography>
              <Typography variant="h5" color={colors.greenAccent[500]}>
                pH Level
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ScienceIcon
                sx={{ color: colors.greenAccent[600], fontSize: "24px" }}
              />
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt="10px">
            {phIconLabel.icon}
            <Typography variant="body2" color={colors.grey[300]} ml="5px">
              {phIconLabel.label}
            </Typography>
          </Box>
        </Box>

        <Box
          gridColumn={{ xs: "span 1", sm: "span 1", md: "span 4" }}
          backgroundColor={colors.primary[400]}
          sx={{
            padding: "15px",
            borderRadius: "8px",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: { xs: "none", sm: "scale(1.05)" },
              boxShadow: { xs: "none", sm: `0 4px 8px rgba(0, 0, 0, 0.2)` },
            },
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h3" fontWeight="bold" color={colors.grey[100]}>
                {`${latestData.waterLevel}m`}
              </Typography>
              <Typography variant="h5" color={colors.greenAccent[500]}>
                Water Level
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <OpacityIcon
                sx={{ color: colors.greenAccent[600], fontSize: "24px" }}
              />
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt="10px">
            {waterLevelIconLabel.icon}
            <Typography variant="body2" color={colors.grey[300]} ml="5px">
              {waterLevelIconLabel.label}
            </Typography>
          </Box>
        </Box>

        {/* CHART SECTION */}
        {/* Suhu Graph */}
        <Box
          gridColumn={{ xs: "span 1", sm: "span 2", md: "span 4" }}
          gridRow="span 1"
          backgroundColor={colors.primary[400]}
          sx={{
            padding: { xs: "10px", sm: "15px" },
            borderRadius: "8px",
            height: { xs: "400px", sm: "350px", md: "350px" },
            minHeight: { xs: "350px" },
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h6"
            color={colors.grey[100]}
            mb={{ xs: "5px", sm: "10px" }}
            fontSize={{ xs: "1rem", sm: "1.25rem" }}
          >
            Suhu (°C)
          </Typography>
          <Box height="95%" width="100%">
            <GrafikSuhu data={temperatureData} />
          </Box>
        </Box>

        {/* pH Graph */}
        <Box
          gridColumn={{ xs: "span 1", sm: "span 2", md: "span 4" }}
          gridRow="span 1"
          backgroundColor={colors.primary[400]}
          sx={{
            padding: { xs: "10px", sm: "15px" },
            borderRadius: "8px",
            height: { xs: "400px", sm: "350px", md: "350px" },
            minHeight: { xs: "350px" },
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h6"
            color={colors.grey[100]}
            mb={{ xs: "5px", sm: "10px" }}
            fontSize={{ xs: "1rem", sm: "1.25rem" }}
          >
            pH Level
          </Typography>
          <Box height="95%" width="100%">
            <GrafikPH data={phData} />
          </Box>
        </Box>

        {/* Water Level Graph */}
        <Box
          gridColumn={{ xs: "span 1", sm: "span 2", md: "span 4" }}
          gridRow="span 1"
          backgroundColor={colors.primary[400]}
          sx={{
            padding: { xs: "10px", sm: "15px" },
            borderRadius: "8px",
            height: { xs: "400px", sm: "350px", md: "350px" },
            minHeight: { xs: "350px" },
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h6"
            color={colors.grey[100]}
            mb={{ xs: "5px", sm: "10px" }}
            fontSize={{ xs: "1rem", sm: "1.25rem" }}
          >
            Ketinggian Air (m)
          </Typography>
          <Box height="95%" width="100%">
            <GrafikWaterLevel data={waterLevelData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;