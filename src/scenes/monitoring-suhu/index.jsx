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
import CanvasTemperatureChart from "../../components/grafiksuhu";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";
import { useLanguage } from "../../contexts/LanguageContext";

const getStatus = (value, type, translate) => {
  if (type === "temperature") {
    return value < 20 ? translate("status_low") : value > 30 ? translate("status_high") : translate("status_normal");
  }
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

const MonitorSuhu = () => {
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
    if (data) {
      // Ganti ini:
      // const timestamp = data.timestamp ? new Date(data.timestamp * 1000) : new Date();

      // Jadi selalu ambil waktu client saat data diterima:
      const timestamp = new Date();
      const readableTimestamp = timestamp.toLocaleString();

      setSensorData((prev) => {
        const newData = [
          ...prev,
          {
            time: readableTimestamp,
            temperature: data.suhu || 0,
          },
        ];
        return isMobile ? newData.slice(-15) : newData.slice(-50);
      });
    }
    setIsLoading(false);
  });

  return () => unsubscribe();
}, [isMobile]);


  const latestData = sensorData[sensorData.length - 1] || { temperature: 0, time: "-" };
  
  // Format data for chart
  const formattedChartData = sensorData.map((entry) => ({
    x: entry.time,
    y: Math.round(entry.temperature * 10) / 10
  }));

  const status = getStatus(latestData.temperature, "temperature", translate);
  const { icon, label } = getIconAndLabel(status, translate);

  return (
    <>
      <Box sx={{ margin: "30px 0px 0px 40px" }}>
        <Header
          title={translate("monitor_temperature_title")}
          subtitle={translate("monitor_temperature_subtitle")}
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
                  {isLoading ? "..." : `${latestData.temperature}°C`}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {translate("monitor_temperature_label")}
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
                  justifyContent: "center"
                }}
              >
                <ThermostatIcon
                  sx={{
                    color: status === translate("status_high") 
                      ? colors.redAccent[500] 
                      : status === translate("status_low") 
                        ? colors.blueAccent[500] 
                        : colors.greenAccent[500],
                    fontSize: "32px",
                  }}
                />
              </Box>
            </Box>
            {/* Temperature Range Legend */}
            <Box mt={2} sx={{ borderTop: `1px solid ${colors.grey[600]}`, pt: 2 }}>
              <Typography variant="body2" color={colors.grey[400]} mb={1}>
                {translate("temperature_ranges")}:
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
                    {translate("status_high")}: {translate("temp_high_range")}
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
                    {translate("status_normal")}: {translate("temp_normal_range")}
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
                    {translate("status_low")}: {translate("temp_low_range")}
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
              {translate("temperature_history")}
            </Typography>
            {isLoading ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="90%">
                <Typography variant="body1" color={colors.grey[300]}>
                  {translate("loading_data")}...
                </Typography>
              </Box>
            ) : sensorData.length === 0 ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="90%">
                <Typography variant="body1" color={colors.grey[300]}>
                  {translate("no_data_available")}
                </Typography>
              </Box>
            ) : (
              <Box height="90%">
                <CanvasTemperatureChart data={formattedChartData} isMobile={isMobile} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MonitorSuhu;