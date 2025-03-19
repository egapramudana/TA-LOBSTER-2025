import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";

const StatusAlat = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [alatData, setAlatData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping alat dengan key di Firebase
  const alatMapping = [
    {
      nama: "Power Supply",
      gambar: "/assets/power-supply.jpeg",
      getStatus: (data) => data.wifi && data.firebase, // Detected jika WiFi & Firebase terhubung
    },
    {
      nama: "Aerator",
      gambar: "/assets/aerator.jpeg",
      getStatus: (data) => data.aerator !== undefined, // Contoh: tambahkan key "aerator" di Firebase
    },
    {
      nama: "Water Pump",
      gambar: "/assets/water-pump.jpeg",
      getStatus: (data) => data.relay_water_pump !== undefined,
    },
    {
      nama: "Sensor Suhu",
      gambar: "/assets/sensor-suhu.jpeg",
      getStatus: (data) => data.temp_sensor === true,
    },
    {
      nama: "Sensor pH",
      gambar: "/assets/sensor-ph.jpeg",
      getStatus: (data) => data.ph_sensor === true,
    },
    {
      nama: "Sensor Ketinggian Air",
      gambar: "/assets/sensor-ketinggian-air.jpeg",
      getStatus: (data) => data.water_level_sensor === true,
    },
    {
      nama: "ESP32",
      gambar: "/assets/esp32.jpeg",
      getStatus: (data) => data.wifi && data.firebase, // Detected jika ESP32 terhubung ke WiFi & Firebase
    },
    {
      nama: "Pemanas Air",
      gambar: "/assets/pemanas-air.jpeg",
      getStatus: (data) => data.relay_heater !== undefined,
    },
    {
      nama: "Pendingin Air Peltier",
      gambar: "/assets/pendingin-air-peltier.jpeg",
      getStatus: (data) => data.relay_cooler !== undefined,
    },
  ];

  useEffect(() => {
    const statusRef = ref(database, "status");
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transformedData = alatMapping.map((alat) => ({
          nama: alat.nama,
          gambar: alat.gambar,
          status: alat.getStatus(data) ? "Detected" : "Not Detected",
        }));
        setAlatData(transformedData);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" mb="20px">
        Status Alat
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        }}
        gap="20px"
        sx={{ padding: "10px" }}
      >
        {alatData.map((alat, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor:
                alat.status === "Not Detected"
                  ? `${colors.redAccent[500]}20`
                  : colors.primary[400],
              p: "20px",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "150px",
              boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: `0 4px 8px rgba(0, 0, 0, 0.2)`,
                backgroundColor:
                  alat.status === "Not Detected"
                    ? `${colors.redAccent[500]}30`
                    : `${colors.primary[400]}b3`,
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="120px"
              mb="20px"
            >
              <img
                src={alat.gambar}
                alt={alat.nama}
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </Box>
            <Typography variant="h6" color={colors.grey[100]} mb="10px">
              {alat.nama}
            </Typography>
            <Typography
              variant="body2"
              color={
                alat.status === "Detected"
                  ? colors.greenAccent[500]
                  : colors.redAccent[500]
              }
              fontWeight="bold"
            >
              {alat.status}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default StatusAlat;