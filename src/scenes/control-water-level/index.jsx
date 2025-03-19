import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Switch,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import OpacityIcon from "@mui/icons-material/Opacity";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import GrafikWaterLevel from "../../components/GrafikWaterLevel";
import { database } from "../../firebase";
import { ref, onValue, update } from "firebase/database";

const ControlKetinggianAir = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [sensorData, setSensorData] = useState([]);
  const [pumpOn, setPumpOn] = useState(false);
  const [mode, setMode] = useState(true);

  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const controlRef = ref(database, "control");

    const sensorUnsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData((prevData) => [
          ...prevData,
          {
            time: new Date().toLocaleTimeString(),
            waterLevel: data.tinggi_air || 0,
          },
        ]);
      }
    });

    const controlUnsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMode(!!data.mode);
        setPumpOn(!!data.pompa_air);
        console.log("Mode:", !!data.mode);
        console.log("Pump On:", !!data.pompa_air);
      }
    });

    return () => {
      sensorUnsubscribe();
      controlUnsubscribe();
    };
  }, []);

  const latestData = sensorData[sensorData.length - 1] || {
    waterLevel: 0,
  };

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

  const handlePumpChange = (event) => {
    const newPumpStatus = event.target.checked;
    setPumpOn(newPumpStatus);
    const controlRef = ref(database, "control");
    update(controlRef, { pompa_air: newPumpStatus });
  };

  return (
    <Box m={isXsScreen ? "10px" : "20px"}>
      <Header title="Kontrol Ketinggian Air" subtitle="Kontrol Pompa Air" />

      <Box
        display="flex"
        flexDirection="column"
        gap="20px"
        sx={{ padding: isXsScreen ? "5px" : "10px" }}
      >
        {/* STATBOX - WATER LEVEL DISPLAY */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <Box
            backgroundColor={colors.primary[400]}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={isXsScreen ? "30px 20px" : "50px"}
            borderRadius="8px"
            width={isXsScreen ? "100%" : "auto"}
            minWidth={isXsScreen ? "unset" : "420px"}
            minHeight={isXsScreen ? "180px" : "200px"}
          >
            <StatBox
              title={`${latestData.waterLevel.toFixed(1)}m`}
              subtitle="Ketinggian Air"
              progress={latestData.waterLevel * 100}
              increase="+0.1m"
              icon={
                <OpacityIcon
                  sx={{ color: colors.greenAccent[600], fontSize: isXsScreen ? "22px" : "26px" }}
                />
              }
            />
          </Box>
        </Box>

        {/* PUMP CONTROL */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <Box
            backgroundColor={colors.primary[400]}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={isXsScreen ? "15px" : "20px"}
            borderRadius="8px"
            width={isXsScreen ? "100%" : "auto"}
            minWidth={isXsScreen ? "unset" : "420px"}
            minHeight={isXsScreen ? "150px" : "200px"}
          >
            <Typography 
              variant={isXsScreen ? "subtitle1" : "h6"} 
              color={colors.grey[100]} 
              mb="10px"
            >
              Pompa Air
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color={colors.grey[100]} mr="10px">
                Off
              </Typography>
              <Switch
                checked={pumpOn}
                onChange={handlePumpChange}
                color="success"
                disabled={mode}
                sx={{
                  "& .MuiSwitch-thumb": {
                    backgroundColor: pumpOn ? colors.greenAccent[600] : colors.grey[500],
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: pumpOn ? colors.greenAccent[600] : colors.grey[500],
                  },
                }}
              />
              <Typography variant="body2" color={colors.grey[100]} ml="10px">
                On
              </Typography>
            </Box>
            {mode && (
              <Typography 
                variant="caption" 
                color={colors.grey[400]} 
                mt="10px" 
                textAlign="center"
              >
                Switch disabled in automatic mode
              </Typography>
            )}
          </Box>
        </Box>

        {/* WATER LEVEL CHART */}
        <Box
          backgroundColor={colors.primary[400]}
          p={isXsScreen ? "15px" : "20px"}
          borderRadius="8px"
          width="100%"
        >
          <Typography 
            variant={isXsScreen ? "subtitle1" : "h6"} 
            color={colors.grey[100]} 
            mb="10px"
          >
            Ketinggian Air Seiring Waktu (m)
          </Typography>
          <Box 
            height={isXsScreen ? "200px" : "250px"} 
            p={isXsScreen ? "5px" : "10px"} 
            borderRadius="8px" 
            backgroundColor={colors.primary[500]}
          >
            <GrafikWaterLevel data={waterLevelData} legendLabel="Ketinggian Air (m)" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ControlKetinggianAir;