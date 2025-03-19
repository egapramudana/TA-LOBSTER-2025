import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Switch,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import GrafikSuhu from "../../components/grafiksuhu";
import { database } from "../../firebase";
import { ref, onValue, update } from "firebase/database";

const KontrolSuhu = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // State untuk menyimpan data sensor
  const [sensorData, setSensorData] = useState([]);

  // State untuk kontrol Water Heater dan Peltier Cooler
  const [waterHeaterOn, setWaterHeaterOn] = useState(false);
  const [peltierCoolerOn, setPeltierCoolerOn] = useState(false);

  // Membaca data sensor dan kontrol dari Firebase
  useEffect(() => {
    const sensorRef = ref(database, "sensor");
    const controlRef = ref(database, "control");

    // Listener untuk data sensor
    const sensorUnsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Simpan data sensor ke state
        setSensorData((prevData) => [
          ...prevData,
          {
            time: new Date().toLocaleTimeString(),
            temperature: data.suhu || 0,
          },
        ]);
      }
    });

    // Listener untuk kontrol water heater dan peltier cooler
    const controlUnsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWaterHeaterOn(!!data.heater);
        setPeltierCoolerOn(!!data.pendingin_peltier);
      }
    });

    // Cleanup listener saat komponen unmount
    return () => {
      sensorUnsubscribe();
      controlUnsubscribe();
    };
  }, []);

  // Ambil data terbaru
  const latestData = sensorData[sensorData.length - 1] || {
    temperature: 0,
  };

  // Filter data berdasarkan timeframe (5 data terakhir)
  const filteredData = sensorData.slice(-5);

  // Format data untuk grafik
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

  // Fungsi untuk memperbarui status water heater di Firebase
  const handleWaterHeaterChange = (event) => {
    const newStatus = event.target.checked;
    setWaterHeaterOn(newStatus);
    const controlRef = ref(database, "control");
    update(controlRef, { heater: newStatus });
  };

  // Fungsi untuk memperbarui status peltier cooler di Firebase
  const handlePeltierCoolerChange = (event) => {
    const newStatus = event.target.checked;
    setPeltierCoolerOn(newStatus);
    const controlRef = ref(database, "control");
    update(controlRef, { pendingin_peltier: newStatus });
  };

  return (
    <Box m={isXsScreen ? "10px" : "20px"}>
      {/* HEADER */}
      <Header title="Kontrol Suhu" subtitle="Kontrol Alat Pengatur Suhu" />

      {/* GRID & CHARTS */}
      <Box
        display="flex"
        flexDirection="column"
        gap="20px"
        sx={{ padding: isXsScreen ? "5px" : "10px" }}
      >
        {/* ROW 1 - STATBOX */}
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
              justifyContent="center"
              alignItems="center"
              title={`${latestData.temperature}°C`}
              subtitle="Temperature"
              progress="0.75"
              increase="+2°C"
              icon={
                <ThermostatIcon
                  sx={{ color: colors.greenAccent[600], fontSize: isXsScreen ? "22px" : "26px" }}
                />
              }
            />
          </Box>
        </Box>

        {/* ROW 2 - SWITCHES */}
        <Box
          display="flex"
          flexDirection={isXsScreen ? "column" : "row"}
          alignItems="center"
          justifyContent="center"
          gap="20px"
          width="100%"
        >
          {/* WATER HEATER */}
          <Box
            backgroundColor={colors.primary[400]}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={isXsScreen ? "15px" : "20px"}
            borderRadius="8px"
            width={isXsScreen ? "100%" : "auto"}
            minWidth={isXsScreen ? "unset" : "200px"}
          >
            <Typography 
              variant={isXsScreen ? "subtitle1" : "h6"} 
              color={colors.grey[100]} 
              mb="10px"
            >
              Water Heater
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color={colors.grey[100]} mr="10px">
                Off
              </Typography>
              <Switch
                checked={waterHeaterOn}
                onChange={handleWaterHeaterChange}
                color="success"
                sx={{
                  "& .MuiSwitch-thumb": {
                    backgroundColor: waterHeaterOn ? colors.greenAccent[600] : colors.grey[500],
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: waterHeaterOn ? colors.greenAccent[600] : colors.grey[500],
                  },
                }}
              />
              <Typography variant="body2" color={colors.grey[100]} ml="10px">
                On
              </Typography>
            </Box>
          </Box>

          {/* PELTIER COOLER */}
          <Box
            backgroundColor={colors.primary[400]}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={isXsScreen ? "15px" : "20px"}
            borderRadius="8px"
            width={isXsScreen ? "100%" : "auto"}
            minWidth={isXsScreen ? "unset" : "200px"}
          >
            <Typography 
              variant={isXsScreen ? "subtitle1" : "h6"} 
              color={colors.grey[100]} 
              mb="10px"
            >
              Pendingin Peltier
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color={colors.grey[100]} mr="10px">
                Off
              </Typography>
              <Switch
                checked={peltierCoolerOn}
                onChange={handlePeltierCoolerChange}
                color="success"
                sx={{
                  "& .MuiSwitch-thumb": {
                    backgroundColor: peltierCoolerOn ? colors.greenAccent[600] : colors.grey[500],
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: peltierCoolerOn ? colors.greenAccent[600] : colors.grey[500],
                  },
                }}
              />
              <Typography variant="body2" color={colors.grey[100]} ml="10px">
                On
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ROW 3 - TEMPERATURE CHART */}
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
            Temperature Over Time (°C)
          </Typography>
          <Box 
            height={isXsScreen ? "200px" : "250px"} 
            p={isXsScreen ? "5px" : "10px"} 
            borderRadius="8px" 
            backgroundColor={colors.primary[500]}
          >
            <GrafikSuhu data={temperatureData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default KontrolSuhu;