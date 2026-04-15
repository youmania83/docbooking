import mongoose, { Document, Schema } from "mongoose";

export interface IAppointmentBooking extends Document {
  bookingId: string;
  patientName: string;
  phone: string;
  doctor: string;
  doctorId?: mongoose.Types.ObjectId;
  clinic: string;
  date: Date;
  time: string;
  address: string;
  location: string;
  status: string;
  notificationStatus?: {
    patientSent?: boolean;
    doctorSent?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentBookingSchema = new Schema<IAppointmentBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    doctor: {
      type: String,
      required: true,
      trim: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
    clinic: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "confirmed",
      trim: true,
    },
    notificationStatus: {
      patientSent: {
        type: Boolean,
        default: false,
      },
      doctorSent: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

AppointmentBookingSchema.index({ doctorId: 1, date: 1, time: 1 });

export default mongoose.models.AppointmentBooking ||
  mongoose.model<IAppointmentBooking>("AppointmentBooking", AppointmentBookingSchema);