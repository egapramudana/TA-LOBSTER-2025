import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Switch,
} from "@mui/material";
import OpacityIcon from "@mui/icons-material/Opacity";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import CanvasWaterLevelChart from "../../components/GrafikWaterLevel";
import { database } from "../../firebase";
import { ref, onValue, update } from "firebase/database";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme, useMediaQuery } from "@mui/material";

const getStatus = (value, translate) => {
  return value < 10 ? translate("status_low") : value > 20 ? translate("status_high") : translate("status_normal");
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

const ControlKetinggianAir = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { translate } = useLanguage();

  const [sensorData, setSensorData] = useState([]);
  const [pumpOn, setPumpOn] = useState(false);
  const [isAutomaticMode, setIsAutomaticMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const controlRef = ref(database, "control");

    setIsLoading(true);

    const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Gunakan waktu saat data diterima (BUKAN dari Firebase)
        const currentTime = new Date();
        const readableTimestamp = currentTime.toLocaleString();

        setSensorData((prev) => {
          const newData = [
            ...prev,
            {
              time: readableTimestamp,
              waterLevel: data.tinggi_air || 0,
            },
          ];
          return isMobile ? newData.slice(-15) : newData.slice(-50);
        });
      }
      setIsLoading(false);
    });

    const unsubscribeControl = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPumpOn(!!data.pompa_air);
        setIsAutomaticMode(!!data.mode);
      }
    });

    return () => {
      unsubscribeSensor();
      unsubscribeControl();
    };
  }, [isMobile]);

  const latestData = sensorData[sensorData.length - 1] || { waterLevel: 0, time: "-" };

  const chartData = [
    {
      data: sensorData.map((entry) => ({
        x: entry.time,
        y: Math.round(entry.waterLevel * 10) / 10,
      })),
    },
  ];

  const handlePumpChange = (event) => {
    const newStatus = event.target.checked;
    setPumpOn(newStatus);
    update(ref(database, "control"), { pompa_air: newStatus });
  };

  const handleModeChange = (event) => {
    const newMode = event.target.checked;
    setIsAutomaticMode(newMode);
    update(ref(database, "control"), { mode: newMode });
  };

  const status = getStatus(latestData.waterLevel, translate);
  const { icon, label } = getIconAndLabel(status, translate);

  return (
    <>
      <Box sx={{ margin: "30px 0px 0px 40px" }}>
        <Header
          title={translate("Control Water")}
          subtitle={translate("Control Water Height")}
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
                  {isLoading ? "..." : `${latestData.waterLevel.toFixed(1)} cm`}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {translate("control_water_height_title")}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  {icon}
                  <Typography variant="h6" color={colors.grey[100]} sx={{ marginLeft: "8px" }}>
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
                <OpacityIcon
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

            <Box mt={3}>
              <Typography variant="h6" color={colors.grey[100]} fontWeight="bold" mb={2}>
                {translate("system_controls")}
              </Typography>

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
                      backgroundColor: isAutomaticMode ? colors.greenAccent[500] : colors.grey[500],
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: isAutomaticMode ? colors.greenAccent[500] : colors.grey[500],
                    },
                  }}
                />
              </Box>

              {!isAutomaticMode && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={1.5}
                  borderRadius="6px"
                  bgcolor={colors.primary[500]}
                >
                  <Typography variant="body1" color={colors.grey[100]}>
                    {translate("water_pump")}
                  </Typography>
                  <Switch
                    checked={pumpOn}
                    onChange={handlePumpChange}
                    color="success"
                    sx={{
                      "& .MuiSwitch-thumb": {
                        backgroundColor: pumpOn ? colors.greenAccent[500] : colors.grey[500],
                      },
                      "& .MuiSwitch-track": {
                        backgroundColor: pumpOn ? colors.greenAccent[500] : colors.grey[500],
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>

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
              {translate("water_height_history")}
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
                <CanvasWaterLevelChart data={chartData} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ControlKetinggianAir;
