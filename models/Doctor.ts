import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  qualification: string;
  experience: string;
  address: string;
  googleLocation: string;
  phone: string;
  opdFees: number;
  specialty: string;
  slots: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, "Please provide a doctor name"],
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", DoctorSchema);
