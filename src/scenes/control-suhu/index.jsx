import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Switch,
} from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import CanvasTemperatureChart from "../../components/grafiksuhu";
import { database } from "../../firebase";
import { ref, onValue, update } from "firebase/database";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme, useMediaQuery } from "@mui/material";

// Helper function untuk status suhu
const getStatus = (value, translate) => {
  if (value < 20) return translate("status_low");
  else if (value > 30) return translate("status_high");
  else return translate("status_normal");
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

const KontrolSuhu = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { translate } = useLanguage();

  const [sensorData, setSensorData] = useState([]);
  const [waterHeaterOn, setWaterHeaterOn] = useState(false);
  const [peltierCoolerOn, setPeltierCoolerOn] = useState(false);
  const [isAutomaticMode, setIsAutomaticMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const controlRef = ref(database, "control");
    
    setIsLoading(true);

    // Subscribe to sensor data
    const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = new Date().toLocaleString(); // Gunakan waktu saat ini

        setSensorData((prev) => {
          // Hindari duplikat waktu
          if (prev.length > 0 && prev[prev.length - 1].time === now) return prev;
          const newData = [
            ...prev,
            {
              time: now,
              temperature: data.suhu || 0,
            },
          ];
          return isMobile ? newData.slice(-15) : newData.slice(-50);
        });
      }
      setIsLoading(false);
    });

    // Subscribe to control data
    const unsubscribeControl = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWaterHeaterOn(!!data.heater);
        setPeltierCoolerOn(!!data.pendingin_peltier);
        setIsAutomaticMode(!!data.mode);
      }
    });

    return () => {
      unsubscribeSensor();
      unsubscribeControl();
    };
  }, [isMobile]);

  const latestData = sensorData[sensorData.length - 1] || { temperature: 0, time: "-" };

  const formattedChartData = sensorData.map((entry) => ({
    x: entry.time,
    y: Math.round(entry.temperature * 10) / 10
  }));

  const handleWaterHeaterChange = (event) => {
    const newStatus = event.target.checked;
    setWaterHeaterOn(newStatus);
    update(ref(database, "control"), { heater: newStatus });
  };

  const handlePeltierCoolerChange = (event) => {
    const newStatus = event.target.checked;
    setPeltierCoolerOn(newStatus);
    update(ref(database, "control"), { pendingin_peltier: newStatus });
  };

  const handleModeChange = (event) => {
    const newMode = event.target.checked;
    setIsAutomaticMode(newMode);
    update(ref(database, "control"), { mode: newMode });
  };

  const status = getStatus(latestData.temperature, translate);
  const { icon, label } = getIconAndLabel(status, translate);

  return (
    <>
      <Box sx={{ margin: "30px 0px 0px 40px" }}>
        <Header 
          title={translate("control_temperature_title")} 
          subtitle={translate("control_temperature_subtitle")} 
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
          {/* Kartu Status Suhu */}
          <Box
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
                  {translate("control_temperature_title")}
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
            
            {/* Controls */}
            <Box mt={3}>
              <Typography 
                variant="h6" 
                color={colors.grey[100]} 
                fontWeight="bold" 
                mb={2}
              >
                {translate("system_controls")}
              </Typography>
              
              {/* Auto Mode Toggle */}
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={2}
                p={1.5}
                borderRadius="6px"
                bgcolor={colors.primary[500]}
              >
                <Typography variant="body1" color={colors.grey[100]}>
                  {translate("automatic_mode")}
                </Typography>
                <Switch
                  checked={isAutomaticMode}
                  onChange={handleModeChange}
                  color="success"
                  sx={{
                    "& .MuiSwitch-thumb": {
                      backgroundColor: isAutomaticMode
                        ? colors.greenAccent[500]
                        : colors.grey[500],
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: isAutomaticMode
                        ? colors.greenAccent[500]
                        : colors.grey[500],
                    },
                  }}
                />
              </Box>
              
              {/* Manual Controls */}
              {!isAutomaticMode && (
                <Box>
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    mb={1.5}
                    p={1.5}
                    borderRadius="6px"
                    bgcolor={colors.primary[500]}
                  >
                    <Typography variant="body1" color={colors.grey[100]}>
                      {translate("water_heater")}
                    </Typography>
                    <Switch
                      checked={waterHeaterOn}
                      onChange={handleWaterHeaterChange}
                      color="success"
                      sx={{
                        "& .MuiSwitch-thumb": {
                          backgroundColor: waterHeaterOn
                            ? colors.greenAccent[500]
                            : colors.grey[500],
                        },
                        "& .MuiSwitch-track": {
                          backgroundColor: waterHeaterOn
                            ? colors.greenAccent[500]
                            : colors.grey[500],
                        },
                      }}
                    />
                  </Box>

                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    p={1.5}
                    borderRadius="6px"
                    bgcolor={colors.primary[500]}
                  >
                    <Typography variant="body1" color={colors.grey[100]}>
                      {translate("peltier_cooler")}
                    </Typography>
                    <Switch
                      checked={peltierCoolerOn}
                      onChange={handlePeltierCoolerChange}
                      color="success"
                      sx={{
                        "& .MuiSwitch-thumb": {
                          backgroundColor: peltierCoolerOn
                            ? colors.greenAccent[500]
                            : colors.grey[500],
                        },
                        "& .MuiSwitch-track": {
                          backgroundColor: peltierCoolerOn
                            ? colors.greenAccent[500]
                            : colors.grey[500],
                        },
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Grafik */}
          <Box
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
                <CanvasTemperatureChart data={formattedChartData} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default KontrolSuhu;
