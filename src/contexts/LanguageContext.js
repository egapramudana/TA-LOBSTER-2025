// src/contexts/LanguageContext.js
import { createContext, useState, useEffect, useContext } from "react";

// Kamus terjemahan
const translations = {
  en: {
    // Topbar
    toggle_theme: "Toggle Light/Dark Mode",
    change_language: "Change Language",
    settings: "Settings",
    logout: "Logout",
    
    // Dashboard
    welcome_lobs: "Lobster Observation System",
    automatic_mode: "Automatic Mode",
    temperature: "Temperature",
    ph_level: "pH Level",
    water_level: "Water Level",
    see_more: "See More",
    safe_mode: "Safe Mode",
    pond_critical: "CRITICAL! 💀",
    pond_warning: "WARNING 😅",
    pond_healthy: "HEALTHY 🥳",
    low: "Low",
    high: "High",
    normal: "Normal",
    
    // General
    dashboard: "Dashboard",
    profile: "Profile",
    users: "Users",
    notifications: "Notifications",
    new_message: "New Message",
    welcome: "Welcome to Dashboard",
    monitor_temperature_title: "Temperature",
    monitor_temperature_subtitle: "Monitoring Temperature Levels",
    monitor_temperature_label: "Temperature",
    status_low: "Low",
    status_high: "High",
    status_normal: "Normal",
    // Temperature range keys
    temperature_ranges: "Temperature Ranges",
    temp_high_range: "> 31°C",
    temp_normal_range: "24°C - 31°C",
    temp_low_range: "< 24°C",
    // pH range keys
    ph_ranges: "pH Ranges",
    ph_high_range: "> 8",
    ph_normal_range: "6 - 8",
    ph_low_range: "< 6",
    // New water level range keys
    water_level_ranges: "Water Level Ranges",
    water_high_range: "> 30 cm",
    water_normal_range: "5cm - 30 cm",
    water_low_range: "< 5 cm",
    monitor_ph_title: "pH Level",
    monitor_ph_subtitle: "Monitoring pH Level",
    monitor_ph_label: "pH Level",
    ph_over_time: "pH Level Over Time",
    menu_home: "Home",
    monitor_section: "Monitor",
    control_section: "Control",
    control_temperature: "Control Temperature",
    control_water_level: "Control Water Level",
    info_section: "Info",
    device_status: "Device Status",
    history: "History",
    monitor_water_title: "Water Level",
    monitor_water_subtitle: "Monitoring Water Level",
    monitor_water_label: "Water Level",
    water_over_time: "Water Level Over Time",
    control_temperature_title: "Temperature Control",
    control_temperature_subtitle: "Control Temperature Adjustment Devices",
    water_heater: "Water Heater",
    peltier_cooler: "Peltier Cooler",
    temperature_over_time: "Temperature Over Time (°C)",
    // Notifications Page
    notifications_title: "Notifications",
    notifications_subtitle: "List of notifications based on sensor data",
    table_time: "Time",
    table_message: "Message",
    table_type: "Type",
    table_status: "Status",
    table_condition: "Condition",
    no_notifications: "No notifications.",
    clear_all: "Clear All",
    status_read: "Read",
    status_unread: "Unread",
    status_normal: "Normal",
    status_warning: "Attention",
    status_danger: "Critical",
    condition_normal: "Normal",
    condition_warning: "Needs Attention",
    condition_danger: "Pond Condition Critical!",
    history_title: "History",
    history_subtitle: "Sensor Data History (Hourly Average)",
    filter_label: "Filter by Day",
    filter_all_days: "All Days",
    filter_monday: "Monday",
    filter_tuesday: "Tuesday",
    filter_wednesday: "Wednesday",
    filter_thursday: "Thursday",
    filter_friday: "Friday",
    filter_saturday: "Saturday",
    filter_sunday: "Sunday",
    table_time: "Time (Hourly)",
    table_temperature: "Temperature (°C)",
    table_ph: "pH Level",
    scroll_to_view_more: "Scroll to View More",
    table_water_level: "Water Level (cm)",
    no_data: "No data available",
    copyright: "Copyright 2025 Kelompok S2TK14",
    status_high_threshold: "High Threshold",
    status_low_threshold: "Low Threshold",
  },
  id: {
    // Topbar
    status_high_threshold: "Threshold Atas",
    status_low_threshold: "Threshold Bawah",
    scroll_to_view_more: "Geser untuk melihat lebih",
    toggle_theme: "Ubah Mode Gelap/Terang",
    change_language: "Ganti Bahasa",
    settings: "Pengaturan",
    logout: "Keluar",
    
    // Dashboard
    welcome_lobs: "Selamat Datang di The LOBS",
    automatic_mode: "Mode Otomatis",
    temperature: "Suhu",
    ph_level: "Level pH",
    water_level: "Tinggi Air",
    see_more: "Lihat Selengkapnya",
    pond_critical: "KRITIS! 💀",
    pond_warning: "PERHATIAN! 😅",
    pond_healthy: "SEHAT 🥳",
    low: "Rendah",
    high: "Tinggi",
    normal: "Normal",
    safe_mode: "Mode Aman",
    // General
    dashboard: "Dasbor",
    profile: "Profil",
    users: "Pengguna",
    notifications: "Notifikasi",
    new_message: "Pesan Baru",
    welcome: "Selamat Datang di Dasbor",
    // Sidebar
    menu_home: "Home",
    monitor_section: "Monitor",
    control_section: "Control",
    control_temperature: "Kontrol Suhu Air",
    control_water_level: "Kontrol Ketinggian Air",
    info_section: "Info",
    device_status: "Device Status",
    history: "History",
    // Monitor Suhu
    monitor_temperature_title: "Suhu",
    monitor_temperature_subtitle: "Pemantauan Tingkat Suhu",
    monitor_temperature_label: "Suhu",
    status_low: "Rendah",
    status_high: "Tinggi",
    status_normal: "Normal",
    // Temperature range keys
    temperature_ranges: "Rentang Suhu",
    temp_high_range: "> 30°C",
    temp_normal_range: "20°C - 30°C",
    temp_low_range: "< 20°C",
    // pH range keys
    ph_ranges: "Rentang pH",
    ph_high_range: "> 8",
    ph_normal_range: "6- 8",
    ph_low_range: "< 6",
    // New water level range keys
    water_level_ranges: "Rentang Ketinggian Air",
    water_high_range: "> 30 cm",
    water_normal_range: "5cm - 30 cm",
    water_low_range: "< 5 cm",
    control_temperature_title: "Kontrol Suhu",
    control_temperature_subtitle: "Kontrol Alat Pengatur Suhu",
    water_heater: "Water Heater",
    peltier_cooler: "Pendingin Peltier",
    temperature_over_time: "Suhu dari Waktu ke Waktu (°C)",
    monitor_ph_title: "Level pH",
    monitor_ph_subtitle: "Pemantauan Tingkat pH",
    monitor_ph_label: "Level pH",
    water_over_time: "Ketinggian Air dari Waktu ke Waktu",
    ph_over_time: "Level pH dari Waktu ke Waktu",
    monitor_water_title: "Ketinggian Air",
    monitor_water_subtitle: "Pemantauan Tingkat Ketinggian Air",
    monitor_water_label: "Ketinggian Air",
    notifications_title: "Notifikasi",
    notifications_subtitle: "Daftar notifikasi berdasarkan data sensor",
    table_time: "Waktu",
    table_message: "Pesan",
    table_type: "Jenis",
    table_status: "Status",
    table_condition: "Kondisi",
    no_notifications: "Tidak ada notifikasi.",
    clear_all: "Hapus Semua",
    status_read: "Dibaca",
    status_unread: "Belum Dibaca",
    status_normal: "Normal",
    status_warning: "Perlu Perhatian",
    status_danger: "Kritis",
    condition_normal: "Normal",
    condition_warning: "Memerlukan Perhatian",
    condition_danger: "Kondisi Kolam KRITIS!",
    history_title: "Riwayat History",
    history_subtitle: "Data Sensor Suhu, pH, dan Ketinggian Air (Rata-Rata Per Jam)",
    filter_label: "Filter Hari",
    filter_all_days: "Semua Hari",
    filter_monday: "Senin",
    filter_tuesday: "Selasa",
    filter_wednesday: "Rabu",
    filter_thursday: "Kamis",
    filter_friday: "Jumat",
    filter_saturday: "Sabtu",
    filter_sunday: "Minggu",
    table_time: "Waktu (Per Jam)",
    table_temperature: "Suhu (°C)",
    table_ph: "pH Level",
    table_water_level: "Ketinggian Air (cm)",
    no_data: "Tidak ada data tersedia",
    copyright: "Copyright 2025 Kelompok S2TK14"
  }
};

// Membuat context untuk bahasa
const LanguageContext = createContext();

// Provider untuk context
export const LanguageProvider = ({ children }) => {
  // Mengambil bahasa dari localStorage atau menggunakan bahasa default (en)
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage || "en"; // Default bahasa Inggris
  });

  // Fungsi untuk mendapatkan terjemahan
  const translate = (key) => {
    return translations[language][key] || key;
  };

  // Fungsi untuk mengubah bahasa
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Simpan bahasa ke localStorage saat berubah
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, translate, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook untuk menggunakan context
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;