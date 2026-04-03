/**
 * OPTIONAL: Database Seed Script
 * 
 * This file can be used to populate the database with test doctors.
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

// MongoDB connection
async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined");
  }
  await mongoose.connect(mongoURI);
}

// Doctor schema
const doctorSchema = new mongoose.Schema({
  name: String,
  qualification: String,
  experience: String,
  address: String,
  googleLocation: String,
  phone: String,
  opdFees: Number,
  specialty: String,
  slots: [String],
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
];

// Seed database
async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing doctors (optional)
    // const cleaned = await Doctor.deleteMany({});
    // console.log(`Deleted ${cleaned.deletedCount} existing doctors`);

    const result = await Doctor.insertMany(testDoctors);
    console.log(`✅ Successfully added ${result.length} test doctors!`);

    // List all doctors
    const all = await Doctor.find();
    console.log(`\n📊 Total doctors in database: ${all.length}`);
    all.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.name} - ${doc.specialty}`);
    });

    await mongoose.disconnect();
    console.log("\n✨ Done!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
