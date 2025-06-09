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
import { useLanguage } from "../../contexts/LanguageContext";

const getStatus = (value, translate) => {
  return value < 6
    ? translate("status_low")
    : value > 8
    ? translate("status_high")
    : translate("status_normal");
};

const getIconAndLabel = (status, translate) => {
  switch (status) {
    case translate("status_low"):
      return {
        icon: <ArrowDownwardIcon sx={{ color: "#5e9cf5" }} />,
        label: translate("status_low"),
      };
    case translate("status_high"):
      return {
        icon: <ArrowUpwardIcon sx={{ color: "#e57373" }} />,
        label: translate("status_high"),
      };
    default:
      return {
        icon: <HorizontalRuleIcon sx={{ color: "#70d8bd" }} />,
        label: translate("status_normal"),
      };
  }
};

const MonitorPh = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { translate } = useLanguage();

  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    setIsLoading(true);

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      // Debug: cek data dari Firebase
      console.log("Firebase sensor data:", data);

      if (data) {
        const timestamp = new Date();
        const readableTimestamp = timestamp.toLocaleString();
        const shortTimestamp = timestamp.toLocaleTimeString();

        let phValue = null;

        // Cek berbagai kemungkinan struktur data
        if (typeof data.ph === "number") {
          phValue = data.ph;
        } else if (typeof data === "object") {
          // Cari pH di dalam object data
          const entries = Object.values(data);
          for (const entry of entries) {
            if (entry && typeof entry.ph === "number") {
              phValue = entry.ph;
              break;
            }
          }
        }

        console.log("Extracted pH value:", phValue);

        if (phValue !== null && !isNaN(phValue)) {
          const newDataPoint = {
            time: readableTimestamp,
            shortTime: shortTimestamp,
            pH: phValue,
          };

          setSensorData((prev) => {
            // Hindari duplikasi data dengan timestamp yang sama
            const filteredPrev = prev.filter(item => 
              Math.abs(new Date(item.time) - new Date(newDataPoint.time)) > 1000
            );
            
            const combinedData = [...filteredPrev, newDataPoint];
            const maxItems = isMobile ? 15 : 50;
            return combinedData.slice(-maxItems);
          });
        } else {
          console.warn("No valid pH data found in:", data);
          // Jika tidak ada data pH yang valid dan ini adalah first load
          if (sensorData.length === 0) {
            setSensorData([]);
          }
        }
      } else {
        console.warn("No data received from Firebase");
        setSensorData([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isMobile]);

  const latestData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : { pH: 0, time: "-" };

  // Buat data untuk grafik sesuai format yang diharapkan GrafikPH
  const phData = sensorData.length > 0 ? [{
    data: sensorData.map((entry, index) => ({
      x: entry.shortTime || entry.time,
      y: Math.round(entry.pH * 10) / 10,
      time: entry.time,
      index: index,
    }))
  }] : [];

  const status = getStatus(latestData.pH, translate);
  const { icon, label } = getIconAndLabel(status, translate);

  // Debug: tampilkan informasi data
  console.log("Sensor Data Array:", sensorData);
  console.log("Latest Data:", latestData);
  console.log("pH Data for Chart (formatted for GrafikPH):", phData);
  console.log("Data length:", sensorData.length);

  // Jika ada data tapi grafik masih menunjukkan "No Data"
  if (sensorData.length > 0 && phData.length > 0) {
    console.log("Data available for chart. Chart data structure:", phData[0]?.data);
  }

  return (
    <>
      <Box sx={{ margin: "30px 0px 0px 40px" }}>
        <Header
          title={translate("monitor_ph_title")}
          subtitle={translate("monitor_ph_subtitle")}
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
          gap="20px"
          sx={{ padding: "10px" }}
        >
          <Box
            className="card"
            gridColumn={{ xs: "span 1", sm: "span 2", md: "span 4" }}
            backgroundColor={colors.primary[400]}
            sx={{
              padding: "20px",
              borderRadius: "12px",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.25)`,
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" fontWeight="bold" color={colors.grey[100]}>
                  {isLoading ? "..." : `${latestData.pH.toFixed(1)}`}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {translate("monitor_ph_label")}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  {icon}
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    sx={{ marginLeft: "8px" }}
                  >
                    {label}
                  </Typography>
                </Box>
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
                <ScienceIcon
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

            {/* pH Range Legend */}
            <Box mt={2} sx={{ borderTop: `1px solid ${colors.grey[600]}`, pt: 2 }}>
              <Typography variant="body2" color={colors.grey[400]} mb={1}>
                {translate("ph_ranges")}:
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
                    {translate("status_high")}: {translate("ph_high_range")}
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
                    {translate("status_normal")}: {translate("ph_normal_range")}
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
                    {translate("status_low")}: {translate("ph_low_range")}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            className="card"
            gridColumn={{ xs: "span 1", sm: "span 2", md: "span 8" }}
            backgroundColor={colors.primary[400]}
            sx={{
              padding: "20px",
              borderRadius: "12px",
              height: isMobile ? "300px" : "400px",
              overflow: "hidden",
            }}
          >
            <Typography variant="h5" color={colors.grey[100]} mb="15px">
              {translate("ph_over_time")}
            </Typography>
            {isLoading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="90%"
              >
                <Typography variant="body1" color={colors.grey[300]}>
                  {translate("loading_data")}...
                </Typography>
              </Box>
            ) : sensorData.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="90%"
              >
                <Typography variant="body1" color={colors.grey[300]} mb={2}>
                  {translate("no_data_available")}
                </Typography>
                <Typography variant="body2" color={colors.grey[400]}>
                  Debug: sensorData.length = {sensorData.length}
                </Typography>
              </Box>
            ) : (
              <Box height="90%">
                <GrafikPH 
                  data={phData} 
                  isMobile={isMobile} 
                />
                {/* Debug info */}
                <Typography variant="caption" color={colors.grey[500]} sx={{ mt: 1 }}>
                  Debug: Rendering chart with {sensorData.length} data points
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MonitorPh;