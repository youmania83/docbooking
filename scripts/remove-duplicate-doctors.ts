/**
 * Remove duplicate doctors from database
 * Keeps only the first occurrence of each doctor name
 */

import mongoose from "mongoose";
import { connectDB } from "../lib/mongodb";
import Doctor from "../models/Doctor";

async function removeDuplicateDoctors() {
  try {
    await connectDB();
    console.log("🔍 Checking for duplicate doctors...");

    // Get all doctors sorted by creation date
    const allDoctors = await Doctor.find().sort({ createdAt: 1 });
    console.log(`📊 Total doctors in database: ${allDoctors.length}`);

    // Track seen names and IDs to delete
    const seenNames = new Set<string>();
    const idsToDelete: string[] = [];

    for (const doctor of allDoctors) {
      const doctorName = doctor.name.toLowerCase().trim();

      if (seenNames.has(doctorName)) {
        console.log(
          `❌ Duplicate found: "${doctor.name}" (ID: ${doctor._id}) - Will delete`
        );
        idsToDelete.push(doctor._id.toString());
      } else {
        console.log(`✅ Keeping: "${doctor.name}" (ID: ${doctor._id})`);
        seenNames.add(doctorName);
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
