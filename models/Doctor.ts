import crypto from "crypto";
import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  uid: string;
  slug: string;
  name: string;
  clinicName: string;
  qualification: string;
  experience: string;
  address: string;
  googleLocation: string;
  phone: string;
  opdFees: number;
  specialty: string;
  slots: string[];
  about: string;
  timings: { day: string; hours: string }[];
  services: string[];
  isAvailable: boolean;
  patientsSeen: number;
  rating: number;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(),
    },
    name: {
      type: String,
      required: [true, "Please provide a doctor name"],
      trim: true,
    },
    clinicName: {
      type: String,
      trim: true,
      default: "",
    },
    qualification: {
      type: String,
      required: [true, "Please provide qualifications"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Please provide experience"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please provide an address"],
      trim: true,
    },
    googleLocation: {
      type: String,
      required: [true, "Please provide a Google Location link"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      trim: true,
    },
    opdFees: {
      type: Number,
      required: [true, "Please provide OPD fees"],
      min: [0, "OPD fees cannot be negative"],
    },
    specialty: {
      type: String,
      required: [true, "Please provide a specialty"],
      trim: true,
    },
    slots: {
      type: [String],
      default: [],
    },
    about: {
      type: String,
      trim: true,
      default: "",
    },
    timings: {
      type: [{ day: String, hours: String }],
      default: [],
    },
    services: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    patientsSeen: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    slug: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", DoctorSchema);
