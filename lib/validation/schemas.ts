import { z } from "zod";

/**
 * Phone number validation schema
 * Accepts 10-digit Indian phone numbers
 */
export const PhoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, "Phone number must be a valid 10-digit number")
  .transform((val) => val.replace(/\D/g, ""));

/**
 * OTP validation schema
 * 6-digit numeric OTP
 */
export const OtpSchema = z
  .string()
  .regex(/^[0-9]{6}$/, "OTP must be a 6-digit number");

/**
 * Email validation schema
 * Accepts valid email addresses
 */
export const EmailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase();

/**
 * Send OTP request schema (using PHONE and SMS)
 */
export const SendOtpSchema = z.object({
  email: PhoneSchema.optional().or(z.string()),  // For backward compatibility, but accepts phone
  phone: PhoneSchema.optional(),
}).refine(
  (data) => data.phone || (typeof data.email === 'string' && /^[0-9]{10}$/.test(data.email.replace(/\D/g, ""))),
  { message: "Valid phone number is required", path: ["phone"] }
);

/**
 * Verify OTP request schema (using PHONE and SMS)
 */
export const VerifyOtpSchema = z.object({
  email: PhoneSchema.optional().or(z.string()),  // For backward compatibility
  phone: PhoneSchema.optional(),
  otp: OtpSchema,
}).refine(
  (data) => data.phone || (typeof data.email === 'string' && /^[0-9]{10}$/.test(data.email.replace(/\D/g, ""))),
  { message: "Valid phone number is required", path: ["phone"] }
);

/**
 * Booking details schema
 */
export const BookingSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientEmail: z.string().email("Invalid email address"),
  patientPhone: PhoneSchema,
  appointmentDate: z.string().datetime("Invalid date format"),
  notes: z.string().optional(),
});

/**
 * Admin login schema
 */
export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Type exports for use in services and API routes
export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type BookingInput = z.infer<typeof BookingSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
