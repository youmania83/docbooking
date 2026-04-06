#!/usr/bin/env node

/**
 * Remove duplicate doctors from database (JavaScript version)
 * Run with: node scripts/remove-duplicate-doctors.js
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const Doctor = require("./doctor.model");

async function removeDuplicateDoctors() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not set in .env.local");
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB\n");

    console.log("🔍 Checking for duplicate doctors...");

    // Get all doctors sorted by creation date
    const allDoctors = await Doctor.find().sort({ createdAt: 1 });
    console.log(`📊 Total doctors in database: ${allDoctors.length}\n`);

    // Track seen names and IDs to delete
    const seenNames = new Map();
    const idsToDelete = [];

    for (const doctor of allDoctors) {
      const doctorName = doctor.name.toLowerCase().trim();

      if (seenNames.has(doctorName)) {
        console.log(
          `❌ DUPLICATE: "${doctor.name}" (ID: ${doctor._id}) - WILL DELETE`
        );
        idsToDelete.push(doctor._id.toString());
      } else {
        console.log(
          `✅ KEEPING: "${doctor.name}" (ID: ${doctor._id}) specialty: ${doctor.specialty}`
        );
        seenNames.set(doctorName, doctor._id);
      }
    }

    console.log("\n" + "=".repeat(60));

    if (idsToDelete.length === 0) {
      console.log("✨ No duplicates found! Database is clean.");
      await mongoose.disconnect();
      console.log("✅ Disconnected from MongoDB");
      return;
    }

    // Delete duplicate doctors
    console.log(
      `\n🗑️  Deleting ${idsToDelete.length} duplicate doctor(s)...`
    );
    const result = await Doctor.deleteMany({
      _id: { $in: idsToDelete.map((id) => mongoose.Types.ObjectId(id)) },
    });

    console.log(`✅ Successfully deleted ${result.deletedCount} doctor(s)\n`);

    // Show final count
    const finalCount = await Doctor.countDocuments();
    console.log(`📈 Final doctor count: ${finalCount}`);
    console.log("✨ Cleanup complete!\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
removeDuplicateDoctors();
