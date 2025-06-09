import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import OpacityIcon from "@mui/icons-material/Opacity";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import GrafikWaterLevel from "../../components/GrafikWaterLevel";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";
import { useLanguage } from "../../contexts/LanguageContext";

// Fungsi untuk status tinggi air
const getStatus = (value, translate) => {
  return value < 10
    ? translate("status_low")
    : value > 20
    ? translate("status_high")
    : translate("status_normal");
};

const getIconAndLabel = (status, translate) => {
  switch (status) {
    case translate("status_low"):
      return { icon: <ArrowDownwardIcon sx={{ color: "#5e9cf5" }} />, label: translate("status_low") };
    case translate("status_high"):
      return { icon: <ArrowUpwardIcon sx={{ color: "#e57373" }} />, label: translate("status_high") };
    default:
      return { icon: <HorizontalRuleIcon sx={{ color: "#70d8bd" }} />, label: translate("status_normal") };
  }
};

const MonitorWater = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sensorData, setSensorData] = useState([]);
  const { translate } = useLanguage();

  // Ambil data tinggi air dari Firebase secara real-time
  useEffect(() => {
    const sensorRef = ref(database, "sensor");

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const readableTimestamp = new Date().toLocaleString(); // Gunakan waktu saat ini atau sesuaikan dengan timestamp dari data
        setSensorData((prev) => {
          const newData = [
            ...prev,
            {
              time: readableTimestamp,
              waterLevel: data.tinggi_air || 0,
            },
          ];
          return newData.slice(-20); // Simpan hanya 20 entri terakhir
        });
      }
    });

    return () => unsubscribe(); // Cleanup listener saat komponen unmount
  }, []);

  const latestData = sensorData[sensorData.length - 1] || { waterLevel: 0, time: "-" };
  const filteredData = sensorData.slice(-5);

  const waterLevelData = [
    {
      id: "Water Level",
      color: "hsl(200, 70%, 50%)",
      data: filteredData.map((entry) => ({
        x: entry.time,
        y: Math.round(entry.waterLevel * 10) / 10,
      })),
    },
  ];

  const status = getStatus(latestData.waterLevel, translate);
  const { icon, label } = getIconAndLabel(status, translate);

  return (
    <>
      {/* HEADER */}
      <Box sx={{ margin: "30px 0px 0px 40px" }}>
        <Header
          title={translate("monitor_water_title")}
          subtitle={translate("monitor_water_subtitle")}
        />
      </Box>

      {/* KONTEN UTAMA */}
      <Box sx={{ margin: "0 20px 0px 20px" }}>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(12, 1fr)",
          }}
          gap="30px"
          sx={{ padding: "10px" }}
        >
          {/* BOX STATUS TINGGI AIR */}
          <Box
            className="card"
            gridColumn={{ xs: "span 1", sm: "span 2", md: "span 4" }}
            backgroundColor={colors.primary[400]}
            sx={{
              padding: "20px",
              borderRadius: "8px",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.25)`,
              },
            }}
          >
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="h3" fontWeight="bold" color={colors.grey[100]}>
                  {`${latestData.waterLevel.toFixed(1)} cm`}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {translate("monitor_water_label")}
                </Typography>
                <Typography variant="h6" color={colors.grey[100]} mt={1}>
                  {icon} {label}
                </Typography>
                <Typography variant="body2" color={colors.grey[400]} mt={1}>
                  {translate("last_updated")}: {latestData.time}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: colors.primary[500],
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <OpacityIcon
                  sx={{
                    color:
                      status === translate("status_high")
                        ? colors.redAccent[500]
                        : status === translate("status_low")
                        ? colors.blueAccent[500]
                        : colors.greenAccent[500],
                    fontSize: "32px",
                  }}
                />
              </Box>
            </Box>
            {/* Water Level Range Legend */}
            <Box mt={2} sx={{ borderTop: `1px solid ${colors.grey[600]}`, pt: 2 }}>
              <Typography variant="body2" color={colors.grey[400]} mb={1}>
                {translate("water_level_ranges")}:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={isMobile ? 1 : 2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#e57373",
                    }}
                  />
                  <Typography variant="body2" color={colors.grey[100]}>
                    {translate("status_high")}: {translate("water_high_range")}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#70d8bd",
                    }}
                  />
                  <Typography variant="body2" color={colors.grey[100]}>
                    {translate("status_normal")}: {translate("water_normal_range")}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#5e9cf5",
                    }}
                  />
                  <Typography variant="body2" color={colors.grey[100]}>
                    {translate("status_low")}: {translate("water_low_range")}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* BOX GRAFIK TINGGI AIR */}
          <Box
            className="card"
            gridColumn={{ xs: "span 1", sm: "span 2", md: "span 8" }}
            backgroundColor={colors.primary[400]}
            sx={{
              padding: isMobile ? "15px" : "25px",
              borderRadius: "8px",
              height: isMobile ? "320px" : "400px",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.01)",
                boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`,
              },
            }}
          >
            <Typography variant="h5" color={colors.grey[100]} mb="20px">
              {translate("water_over_time")}
            </Typography>
            <Box
              height={isMobile ? "240px" : "320px"}
              sx={{
                paddingRight: "10px",
                paddingLeft: "10px",
                paddingBottom: "20px",
              }}
            >
              <GrafikWaterLevel data={waterLevelData} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MonitorWater;