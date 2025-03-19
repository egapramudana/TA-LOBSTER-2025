// src/models/Notification.js
export class Notification {
    constructor(id, message, type, timestamp) {
      this.id = id; // ID unik untuk setiap notifikasi
      this.message = message; // Pesan notifikasi
      this.type = type; // Jenis notifikasi (e.g., "temperature", "pH", "waterLevel")
      this.timestamp = timestamp; // Waktu notifikasi dibuat
      this.isRead = false; // Status apakah notifikasi sudah dibaca atau belum
    }
  
    markAsRead() {
      this.isRead = true;
    }
  }