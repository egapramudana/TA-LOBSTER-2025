// src/scenes/monitorsuhu/index.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import GrafikSuhu from "../../components/grafiksuhu";
import { database } from "../../firebase";
import { ref, onValue, get } from "firebase/database";

const getStatus = (value, type) => {
  if (type === "temperature") {
    return value < 20 ? "Rendah" : value > 30 ? "Tinggi" : "Normal";
  }
};

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

const MonitorSuhu = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    get(sensorRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const initialData = Object.keys(data).map((key) => ({
          time: new Date(parseInt(key)).toLocaleString(),
          temperature: data[key].suhu || 0,
        }));
        setSensorData(initialData.slice(-20));
      }
    });

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prev) => {
          const newData = [
            ...prev,
            {
              time: new Date().toLocaleString(),
              temperature: data.suhu || 0,
            },
          ];
          return newData.slice(-20);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const latestData = sensorData[sensorData.length - 1] || { temperature: 0 };
  const filteredData = sensorData.slice(-5);

  const temperatureData = [
    {
      id: "Temperature",
      color: "hsl(0, 70%, 50%)",
      data: filteredData.map((entry) => ({
        x: entry.time,
        y: Math.round(entry.temperature),
      })),
    },
  ];

  const status = getStatus(latestData.temperature, "temperature");
  const { icon, label } = getIconAndLabel(status);

  return (
    <>
      <Box sx={{ margin: "30px 0px 0px 40px" }}>
        <Header
          title="Temperature"
          subtitle="Monitoring Temperature Levels"
        />
      </Box>

      <Box sx={{ margin: "0 20px 0px 20px" }}>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(12, 1fr)",
          }}
          gridAutoRows="auto"
          gap="20px"
          sx={{ padding: "10px" }}
        >
          <Box
            gridColumn={{ xs: "span 1", sm: "span 2", md: "span 4" }}
            backgroundColor={colors.primary[400]}
            sx={{
              padding: "15px",
              borderRadius: "8px",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: `0 4px 8px rgba(0, 0, 0, 0.2)`,
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" fontWeight="bold" color={colors.grey[100]}>
                  {`${latestData.temperature}°C`}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Temperature
                </Typography>
                <Box display="flex" alignItems="center">
                  {icon}
                  <Typography variant="h6" color={colors.grey[100]} sx={{ marginLeft: "8px" }}>
                    {label}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <ThermostatIcon sx={{ color: colors.greenAccent[600], fontSize: "24px" }} />
              </Box>
            </Box>
          </Box>

          <Box
            gridColumn={{ xs: "span 1", sm: "span 2", md: "span 12" }}
            backgroundColor={colors.primary[400]}
            sx={{
              padding: "15px",
              borderRadius: "8px",
              height: isMobile ? "200px" : "400px",
              overflow: "hidden",
            }}
          >
            <Typography variant="h6" color={colors.grey[100]} mb="10px">
              Suhu (°C)
            </Typography>
            <Box height="100%">
              <GrafikSuhu data={temperatureData} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MonitorSuhu;
