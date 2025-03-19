import { ResponsiveLine } from "@nivo/line";
import { useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../theme";

const GrafikPH = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ResponsiveLine
      data={data}
      theme={{
        background: colors.primary[400],
        axis: {
          domain: { line: { stroke: colors.grey[100] } },
          legend: { text: { fill: colors.grey[100] } },
          ticks: {
            line: { stroke: colors.grey[100], strokeWidth: 1 },
            text: { fill: colors.grey[100] },
          },
        },
        legends: { text: { fill: colors.grey[100] } },
        tooltip: { container: { background: colors.primary[500], color: colors.grey[100] } },
        grid: { line: { stroke: colors.grey[300], strokeWidth: 0.5 } },
      }}
      colors={{ datum: "color" }}
      margin={isMobile ? 
        { top: 30, right: 30, bottom: 75, left: 50 } : 
        { top: 50, right: 60, bottom: 80, left: 70 }
      }
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: 14,
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="monotoneX"
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: isMobile ? -65 : -45,
        tickValues: data[0]?.data.map((d) => d.x),
        legend: "Waktu",
        legendOffset: isMobile ? 50 : 60,
        legendPosition: "middle",
        format: (value) => isMobile ? value.substring(0, 5) : value, // Shorter time format on mobile
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "pH",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={true}
      pointSize={isMobile ? 6 : 8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      enableArea={true}
      areaOpacity={0.15}
      motionConfig="gentle"
      // For small screens, simplify the line
      enableSlices={isMobile ? "x" : false}
    />
  );
};

export default GrafikPH;