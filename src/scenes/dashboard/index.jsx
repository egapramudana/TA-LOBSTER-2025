import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Switch,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ThermostatIcon from "@mui/icons-material/Thermostat"; // For Temperature
import ScienceIcon from "@mui/icons-material/Science"; // For pH Level
import OpacityIcon from "@mui/icons-material/Opacity"; // For Water Level
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"; // For Low Status
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // For High Status
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule"; // For Normal Status
import WarningIcon from "@mui/icons-material/Warning"; // For Warning
import ErrorIcon from "@mui/icons-material/Error"; // For Error
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // For Normal
import SettingsIcon from "@mui/icons-material/Settings"; // For Control buttons
import Header from "../../components/Header";
import { database } from "../../firebase";
import { ref, onValue, update } from "firebase/database";
import { tokens } from "../../theme";
import { useLanguage } from "../../contexts/LanguageContext"; // Import useLanguage hook
import { useTheme, useMediaQuery } from "@mui/material";

// Fungsi untuk mendapatkan status berdasarkan threshold
const getStatus = (value, type) => {
  if (type === "temperature") {
    return value < 24? "low" : value > 31 ? "high" : "normal";
  } else if (type === "pH") {
    return value < 6 ? "low" : value > 8 ? "high" : "normal";
  } else if (type === "waterLevel") {
    return value < 5 ? "low" : value > 30 ? "high" : "normal";
  }
};

// Fungsi untuk mendapatkan ikon dan label status
const getIconAndLabel = (status, translate) => {
  switch (status) {
    case "low":
      return { icon: <ArrowDownwardIcon />, label: translate("low") };
    case "high":
      return { icon: <ArrowUpwardIcon />, label: translate("high") };
    default:
      return { icon: <HorizontalRuleIcon />, label: translate("normal") };
  }
};

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { translate } = useLanguage(); // Menggunakan hook useLanguage

  // State untuk menyimpan data sensor
  const [sensorData, setSensorData] = useState([]);
  // State untuk mode otomatis
  const [mode, setMode] = useState(false);
  // State untuk safe mode (cutoff)
  const [safeMode, setSafeMode] = useState(false);

  // Sinkronisasi mode otomatis dan safe mode dengan Firebase
  useEffect(() => {
    const controlRef = ref(database, "control");
    const unsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMode(data.mode !== null ? data.mode : false); // Fallback ke false jika data null
        setSafeMode(data.cutoff !== null ? data.cutoff : false); // Fallback ke false jika data null
      }
    });
    return () => unsubscribe(); // Cleanup listener saat komponen unmount
  }, []);

  // Membaca data sensor dari Firebase
  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const readableTimestamp = new Date(data.timestamp * 1000).toLocaleString();
        setSensorData((prevData) => {
          const newData = [
            ...prevData,
            {
              time: readableTimestamp,
              temperature: data.suhu || 0,
              pH: data.ph || 0,
              waterLevel: data.tinggi_air || 0,
            },
          ];
          return newData.slice(-20); // Batasi jumlah entri menjadi 20
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const latestData = sensorData[sensorData.length - 1] || {
    temperature: 0,
    pH: 0,
    waterLevel: 0,
  };

  const temperatureStatus = getStatus(latestData.temperature, "temperature");
  const phStatus = getStatus(latestData.pH, "pH");
  const waterLevelStatus = getStatus(latestData.waterLevel, "waterLevel");

  const temperatureIconLabel = getIconAndLabel(temperatureStatus, translate);
  const phIconLabel = getIconAndLabel(phStatus, translate);
  const waterLevelIconLabel = getIconAndLabel(waterLevelStatus, translate);

  // Menentukan status keseluruhan kolam
  const getOverallStatus = () => {
    const tempValue = latestData.temperature;
    const phValue = latestData.pH;
    const waterValue = latestData.waterLevel;
    if (
      tempValue < 15 ||
      tempValue > 35 ||
      phValue < 5.5 ||
      phValue > 8.5 ||
      waterValue < 5 ||
      waterValue > 55
    ) {
      return "danger";
    }
    if (
      temperatureStatus !== "normal" ||
      phStatus !== "normal" ||
      waterLevelStatus !== "normal"
    ) {
      return "warning";
    }
    return "normal";
  };

  const overallStatus = getOverallStatus();

  // Mendapatkan warna sesuai status
  const getStatusColor = (status) => {
    switch (status) {
      case "danger":
        return colors.redAccent[500];
      case "warning":
        return "#FFD700";
      default:
        return colors.greenAccent[500];
    }
  };

  const statusColor = getStatusColor(overallStatus);

  // Mendapatkan pesan status
  const getStatusMessage = () => {
    switch (overallStatus) {
      case "danger":
        return translate("pond_critical");
      case "warning":
        return translate("pond_warning");
      default:
        return translate("pond_healthy");
    }
  };

  // Mendapatkan ikon status
  const getStatusIcon = () => {
    switch (overallStatus) {
      case "danger":
        return <ErrorIcon sx={{ fontSize: 40, verticalAlign: "middle", mr: 1 }} />;
      case "warning":
        return <WarningIcon sx={{ fontSize: 40, verticalAlign: "middle", mr: 1 }} />;
      default:
        return <CheckCircleIcon sx={{ fontSize: 40, verticalAlign: "middle", mr: 1 }} />;
    }
  };

  // Fungsi untuk mengatur warna label status
  const getStatusLabelColor = (status) => {
    switch (status) {
      case "low":
      case "high":
        return "red";
      case "normal":
        return "green";
      default:
        return colors.grey[300];
    }
  };

  // Fungsi untuk menangani perubahan safe mode
  const handleSafeModeChange = (event) => {
    const newSafeMode = event.target.checked;
    setSafeMode(newSafeMode);
    update(ref(database, "control"), { cutoff: newSafeMode });
  };

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
        <Header title="The LOBS" subtitle={translate("welcome_lobs")} />
        <Box display="flex" flexDirection="column" alignItems="flex-end" gap="10px">
          {/* Mode Otomatis */}
          <Box display="flex" alignItems="center">
            <Typography
              variant="body1"
              color={colors.grey[100]}
              mr={2}
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
            >
              {translate("automatic_mode")}
            </Typography>
            <Switch
              checked={mode}
              onChange={(event) => {
                const newMode = event.target.checked;
                setMode(newMode);
                update(ref(database, "control"), { mode: newMode });
              }}
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
          {/* Safe Mode (Cutoff) */}
          <Box display="flex" alignItems="center">
            <Typography
              variant="body1"
              color={colors.grey[100]}
              mr={2}
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
            >
              {translate("safe_mode")}
            </Typography>
            <Switch
              checked={safeMode}
              onChange={handleSafeModeChange}
              color="success"
              sx={{
                "& .MuiSwitch-thumb": {
                  backgroundColor: safeMode ? colors.greenAccent[600] : colors.grey[500],
                },
                "& .MuiSwitch-track": {
                  backgroundColor: safeMode ? colors.greenAccent[600] : colors.grey[500],
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* STATUS SUMMARY - TENGAH */}
      <Box
        width="100%"
        textAlign="center"
        py={3}
        mb={3}
        p={3}
        backgroundColor={colors.primary[400]}
        borderRadius="8px"
        sx={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.3s ease",
          cursor: "pointer",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        <Typography
          variant="h5"
          color={colors.grey[100]}
          sx={{ mb: 0.5, fontSize: { xs: "1rem", sm: "1.5rem", md: "2rem" } }}
        >
          {translate("POND CONDITION")}:
        </Typography>
        <Typography
          variant="h1"
          fontWeight="bold"
          color={statusColor}
          sx={{
            textShadow:
              overallStatus !== "normal" ? `0 0 50px ${statusColor}80` : "none",
            animation:
              overallStatus !== "normal" ? "pulse 1s infinite" : "none",
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.5 },
              "100%": { opacity: 1 },
            },
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
          }}
        >
          {getStatusIcon()}
          {getStatusMessage()}
        </Typography>
        {overallStatus !== "normal" && (
          <Typography
            variant="h5"
            color={colors.grey[100]}
            mt={1}
            sx={{ opacity: 0.9, fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
          >
            {temperatureStatus !== "normal" &&
              `${translate("temperature")}: ${latestData.temperature}°C `}
            {temperatureStatus !== "normal" && (
              <Typography
                component="span"
                variant="h5"
                color={getStatusLabelColor(temperatureStatus)}
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
              >
                ({translate(temperatureStatus)})
              </Typography>
            )}
            {phStatus !== "normal" && ` pH: ${latestData.pH} `}
            {phStatus !== "normal" && (
              <Typography
                component="span"
                variant="h5"
                color={getStatusLabelColor(phStatus)}
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
              >
                ({translate(phStatus)})
              </Typography>
            )}
            {waterLevelStatus !== "normal" &&
              ` ${translate("water_level")}: ${latestData.waterLevel}cm `}
            {waterLevelStatus !== "normal" && (
              <Typography
                component="span"
                variant="h5"
                color={getStatusLabelColor(waterLevelStatus)}
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
              >
                ({translate(waterLevelStatus)})
              </Typography>
            )}
          </Typography>
        )}
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
        {/* BOX TEMPERATURE */}
        <Box
          gridColumn={{ xs: "span 1", sm: "span 1", md: "span 4" }}
          backgroundColor={colors.primary[400]}
          sx={{
            padding: "15px",
            borderRadius: "8px",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              transform: { xs: "none", sm: "scale(1.05)" },
              boxShadow: { xs: "none", sm: `0 4px 8px rgba(0, 0, 0, 0.2)` },
            },
          }}
          onClick={() => navigate("/monitoring-suhu")}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.grey[100]}
                sx={{ fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" } }}
              >
                {`${latestData.temperature}°C`}
              </Typography>
              <Typography
                variant="h5"
                color={colors.greenAccent[500]}
                sx={{ fontSize: { xs: "1rem", sm: "1.15rem", md: "1.3rem" } }}
              >
                {translate("temperature")}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ThermostatIcon
                sx={{
                  color: colors.greenAccent[600],
                  fontSize: "24px",
                }}
              />
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt="10px">
            {temperatureIconLabel.icon}
            <Typography
              variant="h6"
              color={getStatusLabelColor(temperatureStatus)}
              ml="5px"
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
            >
              {temperatureIconLabel.label}
            </Typography>
          </Box>
          {/* Added navigation buttons */}
          <Box display="flex" justifyContent="space-between" mt="15px">
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/monitoring-suhu");
              }}
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.blueAccent[800],
                },
                flex: 1,
                mr: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
              }}
            >
              {translate("see_more")}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate("/control-suhu");
              }}
              sx={{
                backgroundColor: colors.greenAccent[700],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.greenAccent[800],
                },
                flex: 1,
                ml: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
              }}
            >
              {translate("control")}
            </Button>
          </Box>
        </Box>

        {/* BOX pH LEVEL */}
        <Box
          gridColumn={{ xs: "span 1", sm: "span 1", md: "span 4" }}
          backgroundColor={colors.primary[400]}
          sx={{
            padding: "15px",
            borderRadius: "8px",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              transform: { xs: "none", sm: "scale(1.05)" },
              boxShadow: { xs: "none", sm: `0 4px 8px rgba(0, 0, 0, 0.2)` },
            },
          }}
          onClick={() => navigate("/monitoring-ph")}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.grey[100]}
                sx={{ fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" } }}
              >
                {`${latestData.pH}`}
              </Typography>
              <Typography
                variant="h5"
                color={colors.greenAccent[500]}
                sx={{ fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" } }}
              >
                {translate("ph_level")}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ScienceIcon
                sx={{
                  color: colors.greenAccent[600],
                  fontSize: "24px",
                }}
              />
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt="10px">
            {phIconLabel.icon}
            <Typography
              variant="h6"
              color={getStatusLabelColor(phStatus)}
              ml="5px"
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
            >
              {phIconLabel.label}
            </Typography>
          </Box>
          {/* pH only has "See More" button as requested */}
          <Box mt="15px">
            <Button
              fullWidth
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/monitoring-ph");
              }}
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.blueAccent[800],
                },
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
              }}
            >
              {translate("see_more")}
            </Button>
          </Box>
        </Box>

        {/* BOX WATER LEVEL */}
        <Box
          gridColumn={{ xs: "span 1", sm: "span 1", md: "span 4" }}
          backgroundColor={colors.primary[400]}
          sx={{
            padding: "15px",
            borderRadius: "8px",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              transform: { xs: "none", sm: "scale(1.05)" },
              boxShadow: { xs: "none", sm: `0 4px 8px rgba(0, 0, 0, 0.2)` },
            },
          }}
          onClick={() => navigate("/water-level")}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.grey[100]}
                sx={{ fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" } }}
              >
                {`${latestData.waterLevel} cm`}
              </Typography>
              <Typography
                variant="h5"
                color={colors.greenAccent[500]}
                sx={{ fontSize: { xs: "1rem", sm: "1.15rem", md: "1.3rem" } }}
              >
                {translate("water_level")}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <OpacityIcon
                sx={{
                  color: colors.greenAccent[600],
                  fontSize: "24px",
                }}
              />
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt="10px">
            {waterLevelIconLabel.icon}
            <Typography
              variant="h6"
              color={getStatusLabelColor(waterLevelStatus)}
              ml="5px"
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
            >
              {waterLevelIconLabel.label}
            </Typography>
          </Box>
          {/* Added navigation buttons */}
          <Box display="flex" justifyContent="space-between" mt="15px">
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/water-level");
              }}
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.blueAccent[800],
                },
                flex: 1,
                mr: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
              }}
            >
              {translate("see_more")}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate("/control-water-level");
              }}
              sx={{
                backgroundColor: colors.greenAccent[700],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.greenAccent[800],
                },
                flex: 1,
                ml: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
              }}
            >
              {translate("control")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;