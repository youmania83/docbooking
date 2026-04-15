import crypto from "crypto";
import mongoose, { Document, Schema } from "mongoose";

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

export interface IAppointment extends Document {
  uid: string;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(),
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
      trim: true,
      match: [
        /^\d{1,2}:\d{2}\s(AM|PM)$/i,
        "Time must be in H:MM AM/PM format (e.g. 9:00 AM)",
      ],
    },
    status: {
      type: String,
      enum: {
        values: ["confirmed", "cancelled", "completed"],
        message: "{VALUE} is not a valid status",
      },
      default: "confirmed",
    },
  },
  { timestamps: true }
);

// Compound unique index — prevents double-booking the same slot for a doctor.
// Cancelled appointments are excluded so a cancelled slot can be re-booked.
AppointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "cancelled" } },
    name: "unique_doctor_slot",
  }
);

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
