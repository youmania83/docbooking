import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  doctorId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  slot?: string; // Legacy field for backward compatibility
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  termsVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Patient name must be at least 2 characters"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be at least 1"],
      max: [150, "Age must be 150 or less"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^[0-9]{10}$/,
        "Phone number must be a valid 10-digit number",
      ],
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
      match: [
        /^\d{2}:\d{2}\s(AM|PM)$/i,
        "Appointment time must be in HH:MM AM/PM format",
      ],
    },
    slot: {
      type: String,
      required: [true, "Slot is required"],
      trim: true,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
      required: [true, "Terms acceptance is required"],
    },
    termsAcceptedAt: {
      type: Date,
      default: null,
    },
    termsVersion: {
      type: String,
      default: "1.0",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double booking
BookingSchema.index({ doctorId: 1, slot: 1 }, { unique: true });

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
