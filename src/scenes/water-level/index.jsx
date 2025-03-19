// src/scenes/invoices/index.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import OpacityIcon from "@mui/icons-material/Opacity";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import GrafikWaterLevel from "../../components/GrafikWaterLevel";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";

const WaterLevel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            waterLevel: data.tinggi_air || 0,
          },
        ].slice(-20));
      }
    });
    return () => unsubscribe();
  }, []);

  const latestData = sensorData[sensorData.length - 1] || { waterLevel: 0 };
  const filteredData = sensorData.slice(-5);

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
    <>
      {/* HEADER dengan margin yang disesuaikan */}
      <Box sx={{ margin: "30px 0px 0px 40px" }}>
        <Header
          title="Water Level"
          subtitle="Monitoring Water Level"
        />
      </Box>

      {/* Konten utama dengan margin yang disesuaikan */}
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
          {/* Stat Box Water Level */}
          <Box
            gridColumn={{
              xs: "span 1",
              sm: "span 2",
              md: "span 4",
            }}
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="20px"
            borderRadius="8px"
          >
            <StatBox
              title={`${latestData.waterLevel.toFixed(1)}m`}
              subtitle="Water Level"
              progress={0.3}
              increase="+0.05m"
              icon={
                <OpacityIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          </Box>

          {/* Grafik Water Level */}
          <Box
            gridColumn={{
              xs: "span 1",
              sm: "span 2",
              md: "span 12",
            }}
            backgroundColor={colors.primary[400]}
            p="20px"
            borderRadius="8px"
          >
            <Typography variant="h6" color={colors.grey[100]} mb="10px">
              Water Level Over Time
            </Typography>
            <Box
              height="250px"
              p="10px"
              borderRadius="8px"
              backgroundColor={colors.primary[500]}
            >
              <GrafikWaterLevel data={waterLevelData} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default WaterLevel;