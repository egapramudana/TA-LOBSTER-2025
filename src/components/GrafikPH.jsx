import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, useTheme, IconButton, useMediaQuery } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { tokens } from '../theme';
import { useLanguage } from "../contexts/LanguageContext";

const GrafikPH = ({ data = [] }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { translate } = useLanguage();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(isMobile ? 3 : 5);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Extract data points from the input format
  const chartData = data.length > 0 && data[0].data ? data[0].data : [{ x: 'No Data', y: 0 }];

  // Calculate min and max for y-axis (pH range: 0-14)
  const yValues = chartData.map(item => item.y);
  const minY = Math.floor(Math.min(...yValues, 0)); // Min 0 or lower
  const maxY = Math.ceil(Math.max(...yValues, 14)); // Max 14 or higher

  // Set initial startIndex to show most recent data
  useEffect(() => {
    if (chartData.length > 0) {
      const maxStartIndex = Math.max(0, chartData.length - visibleCount);
      setStartIndex(maxStartIndex);
    }
  }, [chartData.length, visibleCount]);

  // Update visible count based on mobile state
  useEffect(() => {
    setVisibleCount(isMobile ? 3 : 5);
  }, [isMobile]);

  // Handle resize to adjust canvas size and visible count
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;

        setCanvasSize({ width, height });

        // Adjust visible count based on width and device type
        const newVisibleCount = isMobile ? 3 : Math.max(5, Math.floor(width / 100));
        setVisibleCount(newVisibleCount);

        // Adjust startIndex to show most recent data
        const maxStartIndex = Math.max(0, chartData.length - newVisibleCount);
        setStartIndex(Math.min(startIndex, maxStartIndex));
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, [chartData.length, startIndex, isMobile]);

  // Format time to HH:MM:SS
  const formatTimeString = (timeStr) => {
    try {
      if (typeof timeStr === 'string') {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) return timeStr;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      }
      return timeStr;
    } catch (e) {
      return timeStr;
    }
  };

  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSize;

    // Set canvas size accounting for device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(pixelRatio, pixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get visible data
    const endIndex = Math.min(startIndex + visibleCount, chartData.length);
    const visibleData = chartData.slice(startIndex, endIndex);

    if (visibleData.length === 0) return;

    // Chart area dimensions with padding
    const padding = { left: 50, right: 20, top: 20, bottom: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw coordinate system
    ctx.strokeStyle = colors.grey[800];
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.grey[100];
    ctx.fillText(translate("pH"), 0, 0);
    ctx.restore();

    // Draw y-axis ticks and grid lines
    const yRange = maxY - minY;
    const yTickCount = 5;
    const yTickStep = yRange / (yTickCount - 1);

    for (let i = 0; i < yTickCount; i++) {
      const yValue = minY + i * yTickStep;
      const yPos = height - padding.bottom - (chartHeight * (yValue - minY) / yRange);

      // Grid line
      ctx.beginPath();
      ctx.strokeStyle = colors.grey[800];
      ctx.setLineDash([3, 3]);
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tick mark and label
      ctx.beginPath();
      ctx.strokeStyle = colors.grey[100];
      ctx.moveTo(padding.left - 5, yPos);
      ctx.lineTo(padding.left, yPos);
      ctx.stroke();

      ctx.fillStyle = colors.grey[100];
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(yValue.toFixed(1), padding.left - 8, yPos);
    }

    // Reference lines for pH ranges
    // Low pH threshold (6.5)
    const lowThresholdY = height - padding.bottom - (chartHeight * (6.5 - minY) / yRange);
    ctx.beginPath();
    ctx.strokeStyle = colors.blueAccent[400];
    ctx.setLineDash([5, 3]);
    ctx.moveTo(padding.left, lowThresholdY);
    ctx.lineTo(width - padding.right, lowThresholdY);
    ctx.stroke();

    ctx.fillStyle = colors.blueAccent[400];
    ctx.textAlign = 'left';
    ctx.fillText(translate("status_low_threshold"), padding.left + 5, lowThresholdY - 5);

    // High pH threshold (8.5)
    const highThresholdY = height - padding.bottom - (chartHeight * (8.5 - minY) / yRange);
    ctx.beginPath();
    ctx.strokeStyle = colors.redAccent[400];
    ctx.moveTo(padding.left, highThresholdY);
    ctx.lineTo(width - padding.right, highThresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colors.redAccent[400];
    ctx.fillText(translate("status_high_threshold"), padding.left + 5, highThresholdY + 15);

    // X-axis ticks and labels
    const xStep = chartWidth / (visibleData.length - 1 || 1);

    visibleData.forEach((point, index) => {
      const xPos = padding.left + index * xStep;

      // Tick mark
      ctx.beginPath();
      ctx.strokeStyle = colors.grey[100];
      ctx.moveTo(xPos, height - padding.bottom);
      ctx.lineTo(xPos, height - padding.bottom + 5);
      ctx.stroke();

      // Format time to show only HH:MM:SS
      const displayTime = formatTimeString(point.x);

      // Label - draw straight and centered below tick
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = colors.grey[100];
      ctx.font = isMobile ? '9px Arial' : '10px Arial';

      // Draw text in two lines to save horizontal space
      const timeLines = displayTime.split(' ');
      if (timeLines.length > 1) {
        ctx.fillText(timeLines[0], xPos, height - padding.bottom + 12);
        ctx.fillText(timeLines[1], xPos, height - padding.bottom + 26);
      } else {
        ctx.fillText(displayTime, xPos, height - padding.bottom + 12);
      }
    });

    // Plot pH line and points
    if (visibleData.length > 1) {
      // Line
      ctx.beginPath();
      ctx.strokeStyle = colors.greenAccent[500];
      ctx.lineWidth = 2;

      visibleData.forEach((point, index) => {
        const xPos = padding.left + index * xStep;
        const yPos = height - padding.bottom - (chartHeight * (point.y - minY) / yRange);

        if (index === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      });

      ctx.stroke();
    }

    // Plot points
    visibleData.forEach((point, index) => {
      const xPos = padding.left + index * xStep;
      const yPos = height - padding.bottom - (chartHeight * (point.y - minY) / yRange);

      // Outer circle
      ctx.beginPath();
      ctx.fillStyle = theme.palette.mode === 'dark' ? colors.primary[500] : '#fff';
      ctx.strokeStyle = colors.greenAccent[500];
      ctx.lineWidth = 2;
      ctx.arc(xPos, yPos, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Store point positions for hit detection
      point._chartX = xPos;
      point._chartY = yPos;
    });

    // Draw legend
    ctx.fillStyle = colors.grey[100];
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const legendX = padding.left;
    const legendY = padding.top - 5;

    // Legend color box
    ctx.fillStyle = colors.greenAccent[500];
    ctx.fillRect(legendX, legendY - 5, 14, 10);

    // Legend text
    ctx.fillStyle = colors.grey[100];
    ctx.fillText(translate("pH"), legendX + 20, legendY);

  }, [chartData, startIndex, visibleCount, canvasSize, colors, theme.palette.mode, minY, maxY, translate, isMobile]);

  // Handle mouse move for tooltips
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get visible data
    const endIndex = Math.min(startIndex + visibleCount, chartData.length);
    const visibleData = chartData.slice(startIndex, endIndex);

    // Check if mouse is over any point
    let found = false;
    for (const point of visibleData) {
      if (!point._chartX || !point._chartY) continue;

      const dx = point._chartX - x;
      const dy = point._chartY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 15) {
        setHoveredPoint(point);
        setTooltipPosition({ x: point._chartX, y: point._chartY });
        found = true;
        break;
      }
    }

    if (!found) {
      setHoveredPoint(null);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Handle navigation
  const handlePrev = () => {
    const newIndex = Math.max(0, startIndex - Math.max(1, Math.floor(visibleCount / 2)));
    setStartIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(
      chartData.length - visibleCount,
      startIndex + Math.max(1, Math.floor(visibleCount / 2))
    );

    if (newIndex > startIndex) {
      setStartIndex(newIndex);
    }
  };

  // Check if navigation is possible
  const canGoBack = startIndex > 0;
  const canGoForward = chartData.length > 0 && startIndex < chartData.length - visibleCount;

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={handlePrev} 
            disabled={!canGoBack}
            sx={{ color: canGoBack ? colors.greenAccent[500] : colors.grey[700] }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="body2" color={colors.grey[100]}>
            {translate("scroll_to_view_more")}
          </Typography>
          <IconButton 
            onClick={handleNext} 
            disabled={!canGoForward}
            sx={{ color: canGoForward ? colors.greenAccent[500] : colors.grey[700] }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color={colors.grey[300]}>
          {chartData.length > 0 ? 
            `${startIndex + 1}-${Math.min(startIndex + visibleCount, chartData.length)} / ${chartData.length}` : 
            '0/0'}
        </Typography>
      </Box>

      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 'calc(100% - 30px)',
          overflow: 'hidden',
          borderRadius: '4px'
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />

        {/* Tooltip */}
        {hoveredPoint && (
          <Box
            sx={{
              position: 'absolute',
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 60}px`,
              backgroundColor: colors.primary[400],
              p: 1.5,
              border: `1px solid ${colors.grey[100]}`,
              borderRadius: '4px',
              pointerEvents: 'none',
              zIndex: 10,
              transform: 'translateX(-50%)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
            }}
          >
            <Typography variant="body2">{hoveredPoint.x}</Typography>
            <Typography variant="body2" color={colors.greenAccent[500]}>
              {`${translate("pH")}: ${hoveredPoint.y.toFixed(1)}`}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GrafikPH;