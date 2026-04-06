/**
 * OPTIONAL: Database Seed Script
 * 
 * This file can be used to populate the database with test doctors.
 * ONLY RUNS IN DEVELOPMENT MODE FOR SAFETY
 * 
 * Usage:
 * 1. Add this to scripts in package.json:
 *    "seed": "node scripts/seed.js"
 * 
 * 2. Create a .env.local file with MONGODB_URI
 * 
 * 3. Run: npm run seed
 * 
 * Note: Run this only once or it will create duplicates
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// Safety check: Only allow in development
if (process.env.NODE_ENV === "production") {
  console.error("❌ SAFETY ERROR: Seed script cannot run in production!");
  console.error("Set NODE_ENV=development to run this script.");
  process.exit(1);
}

// MongoDB connection
async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  await mongoose.connect(mongoURI);
}

// Doctor schema (must match the actual model)
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  qualification: {
    type: String,
    required: true,
    trim: true,
  },
  experience: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  googleLocation: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  opdFees: {
    type: Number,
    required: true,
    min: 0,
  },
  specialty: {
    type: String,
    required: true,
    trim: true,
  },
  slots: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

// Test data
const testDoctors = [
  {
    name: "Dr. Tushar Kalra",
    qualification: "MBBS, MD",
    experience: "12 years",
    specialty: "General Physician",
    address: "123 Medical Centre, Panipat",
    googleLocation:
      "https://maps.google.com/maps?q=medical+centre+panipat",
    phone: "+91 9876543210",
    opdFees: 300,
    slots: ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM"],
  },
  {
    name: "Dr. Ashutosh Kalra",
    qualification: "MBBS, MS",
    experience: "15 years",
    specialty: "Surgeon",
    address: "456 Hospital Road, Panipat",
    googleLocation:
      "https://maps.google.com/maps?q=hospital+panipat",
    phone: "+91 9876543211",
    opdFees: 500,
    slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "5:30 PM"],
  },
  {
    name: "Dr. Keerat Kalra",
    qualification: "BAMS, DGO",
    experience: "10 years",
    specialty: "Gynecologist",
    address: "789 Women's Clinic, Panipat",
    googleLocation:
      "https://maps.google.com/maps?q=womens+clinic+panipat",
    phone: "+91 9876543212",
    opdFees: 400,
    slots: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
  },
  {
    name: "Dr. Pankaj Bajaj",
    qualification: "MBBS, MS, MCh",
    experience: "18 years",
    specialty: "Orthopedic",
    address: "321 Orthopedic Centre, Panipat",
    googleLocation:
      "https://maps.google.com/maps?q=orthopedic+panipat",
    phone: "+91 9876543213",
    opdFees: 600,
    slots: ["9:30 AM", "11:30 AM", "1:30 PM", "3:30 PM", "5:00 PM"],
  },
  {
    name: "Dr. Priya Sharma",
    qualification: "MBBS, MD",
    experience: "8 years",
    specialty: "Pediatrician",
    address: "654 Child Care Clinic, Panipat",
    googleLocation:
      "https://maps.google.com/maps?q=pediatric+clinic+panipat",
    phone: "+91 9876543214",
    opdFees: 350,
    slots: ["10:00 AM", "2:00 PM", "4:30 PM"],
  },
  {
    name: "Dr. Singla",
    qualification: "BDS, MDS",
    experience: "8 years",
    specialty: "Dentist",
    address: "Singla Dental Clinic, Main Road, Panipat",
    googleLocation:
      "https://maps.google.com/?q=singla+dental+clinic+panipat",
    phone: "+91 9876543216",
    opdFees: 500,
    slots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
  },
];

// Seed database
async function seed() {
  try {
    console.log("🌱 Starting database seed...");
    console.log(`Node environment: ${process.env.NODE_ENV || "development"}`);

    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Validate test data
    if (!testDoctors || testDoctors.length === 0) {
      throw new Error("No test doctors defined");
    }

    console.log(`Seeding ${testDoctors.length} doctors...`);

    // Insert doctors with error handling
    const result = await Doctor.insertMany(testDoctors, { ordered: false }).catch(
      (err) => {
        // Ignore duplicate key errors (E11000) but throw others
        if (err.code === 11000) {
          console.warn(
            "⚠️  Some doctors already exist in database. Continuing..."
          );
          return err.insertedDocs || [];
        }
        throw err;
      }
    );

    console.log(
      `✅ Successfully seeded ${result.length} doctor records!`
    );

    // List all doctors
    const all = await Doctor.find();
    console.log(`\n📊 Total doctors in database: ${all.length}`);
    all.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc.name} - ${doc.specialty} (${doc.slots.length} slots)`);
    });

    await mongoose.disconnect();
    console.log("\n✨ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Prevent multiple invocations
let isRunning = false;
if (!isRunning) {
  isRunning = true;
  seed().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
