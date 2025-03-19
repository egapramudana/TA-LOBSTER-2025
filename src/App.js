import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import MonitoringSuhu from "./scenes/monitoring-suhu";
import WaterLevel from "./scenes/water-level";
import MonitoringPh from "./scenes/monitoring-ph";
import ControlSuhu from "./scenes/control-suhu";
import ControlKetinggianAir from "./scenes/control-water-level";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import StatusAlat from "./scenes/status-alat";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import History from "./scenes/history";
import NotificationsPage from "./scenes/notifications/NotificationsPage";

function App() {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sinkronisasi dengan localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) setIsCollapsed(JSON.parse(savedState));
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {/* Sidebar Container */}
          <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
            <Sidebar 
              isCollapsed={isCollapsed} 
              onToggle={toggleSidebar} 
            />
          </div>

          {/* Konten Utama */}
          <main className={`content ${isCollapsed ? 'collapsed' : ''}`}>
            <Topbar 
              isCollapsed={isCollapsed}
              onToggle={toggleSidebar}
            />
            
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/monitoring-suhu" element={<MonitoringSuhu />} />
              <Route path="/monitoring-ph" element={<MonitoringPh />} />
              <Route path="/water-level" element={<WaterLevel />} />
              <Route path="/control-suhu" element={<ControlSuhu />} />
              <Route path="/control-water-level" element={<ControlKetinggianAir />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/status-alat" element={<StatusAlat />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/geography" element={<Geography />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;