// src/scenes/monitorph/index.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import GrafikPH from "../../components/GrafikPH";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";

const getStatus = (value) => {
  return value < 6.5 ? "Rendah" : value > 7.5 ? "Tinggi" : "Normal";
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

const MonitorPh = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prev) => {
          const newData = [
            ...prev,
            {
              time: new Date().toLocaleString(),
              pH: data.ph || 0,
            },
          ];
          return newData.slice(-20);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const latestData = sensorData[sensorData.length - 1] || { pH: 0 };
  const filteredData = sensorData.slice(-5);

  const phData = [
    {
      id: "pH",
      color: "hsl(120, 70%, 50%)",
      data: filteredData.map((entry) => ({
        x: entry.time,
        y: Math.round(entry.pH * 10) / 10,
      })),
    },
  ];

  const status = getStatus(latestData.pH);
  const { icon, label } = getIconAndLabel(status);

  return (
    <>
      <Box sx={{ margin: "30px 0px 0px 40px" }}>
        <Header title="pH Level" subtitle="Monitoring pH Level" />
      </Box>

      <Box sx={{ margin: "0 20px 0px 20px" }}>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(12, 1fr)",
          }}
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
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="h3" fontWeight="bold" color={colors.grey[100]}>
                  {`${latestData.pH.toFixed(1)}`}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  pH Level
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {icon} {label}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <ScienceIcon sx={{ color: colors.greenAccent[600], fontSize: "24px" }} />
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
              pH Level Over Time
            </Typography>
            <Box height="100%">
              <GrafikPH data={phData} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MonitorPh;
