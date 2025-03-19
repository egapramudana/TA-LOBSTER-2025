// src/components/StatBox2.jsx
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const StatBox2 = ({ 
  title, 
  subtitle, 
  icon, 
  progress, 
  increase,
  rendah,
  normal,
  tinggi,
  lowThreshold,
  normalThreshold
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  let statusLabel, statusColor;
  if (progress <= lowThreshold) {
    statusLabel = rendah;
    statusColor = colors.redAccent[500];
  } else if (progress <= normalThreshold) {
    statusLabel = normal;
    statusColor = colors.greenAccent[500];
  } else {
    statusLabel = tinggi;
    statusColor = colors.yellowAccent[500]; // Pastikan ini ada di theme
  }

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography variant="h4" fontWeight="bold" sx={{ color: colors.grey[100] }}>
            {title}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: statusColor }}>
            {statusLabel}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: colors.greenAccent[500] }}>
          {subtitle}
        </Typography>
        <Typography variant="h5" fontStyle="italic" sx={{ color: colors.greenAccent[600] }}>
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox2;