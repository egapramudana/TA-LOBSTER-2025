export class Notification {
  constructor(id, message, type, timestamp, createdAt = Date.now(), expiry = Date.now() + (24 * 60 * 60 * 1000)) {
    this.id = id;
    this.message = message;
    this.type = type;
    this.timestamp = timestamp;
    this.createdAt = createdAt;      // Waktu pembuatan dalam milidetik
    this.expiry = expiry;            // Waktu kedaluwarsa dalam milidetik (default 1 hari)
  }
}