/**
 * Application-wide constants
 */

// OTP Configuration
export const OTP_CONFIG = {
  EXPIRY_SECONDS: 300, // 5 minutes
  RATE_LIMIT_SECONDS: 30, // 30 seconds between sends
  MAX_ATTEMPTS: 5, // Max verification attempts per OTP
  LENGTH: 6, // OTP length
  RESEND_LIMIT: 3, // Max times user can request new OTP
};

// Fast2SMS Configuration
export const FAST2SMS_CONFIG = {
  BASE_URL: "https://www.fast2sms.com/dev/bulkV2",
  TIMEOUT_MS: 10000,
};

// WhatsApp Configuration (alternative)
export const WHATSAPP_CONFIG = {
  BASE_URL: "https://api.whatsapp.com/send",
};

// Database Configuration
export const DB_CONFIG = {
  CONNECTION_TIMEOUT_MS: 5000,
  SOCKET_TIMEOUT_MS: 5000,
};

// API Response Configuration
export const API_CONFIG = {
  DEFAULT_TIMEOUT_MS: 30000,
};

// Role Configuration
export const ROLES = {
  ADMIN: "admin",
  PATIENT: "patient",
  DOCTOR: "doctor",
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};
