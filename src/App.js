// src/App.js
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { LanguageProvider } from "./contexts/LanguageContext"; // Ditambahkan

import { auth } from "./firebase";

// Komponen
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import LandingPage from "./scenes/LandingPage";
import MonitoringSuhu from "./scenes/monitoring-suhu";
import WaterLevel from "./scenes/water-level";
import MonitoringPh from "./scenes/monitoring-ph";
import KontrolSuhu from "./scenes/control-suhu";
import ControlKetinggianAir from "./scenes/control-water-level";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import StatusAlat from "./scenes/status-alat";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";
import History from "./scenes/history";
import NotificationsPage from "./scenes/notifications/NotificationsPage";

function App() {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) setIsCollapsed(JSON.parse(savedState));
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <LanguageProvider> {/* Ditambahkan */}
          <CssBaseline />
          <div className="app">
            {!user ? (
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            ) : (
              <>
                <div className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
                  <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
                </div>
                <main className={`content ${isCollapsed ? "collapsed" : ""}`}>
                  <Topbar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/monitoring-suhu" element={<MonitoringSuhu />} />
                    <Route path="/monitoring-ph" element={<MonitoringPh />} />
                    <Route path="/water-level" element={<WaterLevel />} />
                    <Route path="/control-suhu" element={<KontrolSuhu />} />
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
              </>
            )}
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
