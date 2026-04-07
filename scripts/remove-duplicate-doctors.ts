/**
 * Remove duplicate doctors from database
 * Detects duplicates by:
 * 1. Exact name match (case-insensitive)
 * 2. Similar first name + specialty + fee combo (likely same doctor with name variations)
 */

import mongoose from "mongoose";
import { connectDB } from "../lib/mongodb";
import Doctor from "../models/Doctor";

// Extract first name from doctor name
function getFirstName(name: string): string {
  return name.split(" ")[0].toLowerCase().trim();
}

async function removeDuplicateDoctors() {
  try {
    await connectDB();
    console.log("🔍 Checking for duplicate doctors...");

    // Get all doctors sorted by creation date
    const allDoctors = await Doctor.find().sort({ createdAt: 1 });
    console.log(`📊 Total doctors in database: ${allDoctors.length}\n`);

    // Track seen combinations and IDs to delete
    const seenExactNames = new Set<string>();
    const seenCombinations = new Set<string>(); // firstName + specialty + fee
    const idsToDelete: string[] = [];

    for (const doctor of allDoctors) {
      const doctorName = doctor.name.toLowerCase().trim();
      const firstName = getFirstName(doctor.name);
      const combination = `${firstName}|${doctor.specialty.toLowerCase()}|${doctor.opdFees}`;

      // Check for exact name match
      if (seenExactNames.has(doctorName)) {
        console.log(
          `❌ EXACT DUPLICATE: "${doctor.name}" (ID: ${doctor._id})`
        );
        idsToDelete.push(doctor._id.toString());
      }
      // Check for similar doctors (same first name + specialty + fee)
      else if (seenCombinations.has(combination)) {
        console.log(
          `⚠️  SIMILAR DOCTOR: "${doctor.name}" - ${doctor.specialty}, ₹${doctor.opdFees} (ID: ${doctor._id})`
        );
        idsToDelete.push(doctor._id.toString());
      } else {
        console.log(
          `✅ Keeping: "${doctor.name}" - ${doctor.specialty}, ₹${doctor.opdFees} (ID: ${doctor._id})`
        );
        seenExactNames.add(doctorName);
        seenCombinations.add(combination);
      }
    }

    if (idsToDelete.length === 0) {
      console.log("✨ No duplicates found!");
      await mongoose.disconnect();
      return;
    }

    // Delete duplicate doctors
    console.log(
      `\n🗑️  Deleting ${idsToDelete.length} duplicate doctor(s)...`
    );
    const result = await Doctor.deleteMany({
      _id: { $in: idsToDelete.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    console.log(`✅ Deleted ${result.deletedCount} duplicate doctor(s)`);

    // Show final count
    const finalCount = await Doctor.countDocuments();
    console.log(`\n📈 Final doctor count: ${finalCount}`);

    await mongoose.disconnect();
    console.log("✨ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

removeDuplicateDoctors();
