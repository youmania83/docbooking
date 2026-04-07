import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[0-9]{10,}$/,
        "Please provide a valid 10-digit phone number",
      ],
      index: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"],
      index: { expires: 0 }, // TTL index for automatic deletion
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Safe reuse pattern - check if model already exists
let OtpModel: mongoose.Model<IOtp>;

if (mongoose.models.Otp) {
  OtpModel = mongoose.models.Otp;
} else {
  OtpModel = mongoose.model<IOtp>("Otp", OtpSchema);
}

export default OtpModel;
