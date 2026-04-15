/**
 * reset-and-seed.js
 * Clears all doctors (and related collections) then inserts one test doctor.
 * Run: node scripts/reset-and-seed.js
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not set in .env.local');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { connectTimeoutMS: 10000 });
  const db = mongoose.connection.db;

  // ── Clear collections ──────────────────────────────────────────────────────
  console.log('\nClearing collections...');
  const collections = [
    'doctors',
    'bookings',
    'appointmentbookings',
    'appointments',
    'patients',
  ];

  for (const col of collections) {
    const result = await db.collection(col).deleteMany({});
    console.log(`  ${col}: ${result.deletedCount} deleted`);
  }

  // ── Seed one test doctor ───────────────────────────────────────────────────
  console.log('\nSeeding test doctor...');
  const doctor = {
    uid: crypto.randomUUID(),
    name: 'Dr. Amit Sharma',
    specialty: 'General Physician',
    clinicName: 'DocBooking Clinic',
    qualification: 'MBBS, MD (General Medicine)',
    experience: '10 Years',
    address: 'Model Town, Panipat, Haryana 132103',
    googleLocation: 'https://maps.google.com/?q=Model+Town+Panipat+Haryana',
    phone: '9876543210',
    opdFees: 500,
    slots: [
      '09:00 AM', '09:30 AM',
      '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM',
      '12:00 PM',
      '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM',
      '05:00 PM',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('doctors').insertOne(doctor);

  console.log('\n✅ Done!');
  console.log(`   Doctor ID   : ${result.insertedId}`);
  console.log(`   Name        : ${doctor.name}`);
  console.log(`   Specialty   : ${doctor.specialty}`);
  console.log(`   Clinic      : ${doctor.clinicName}`);
  console.log(`   Address     : ${doctor.address}`);
  console.log(`   Phone       : ${doctor.phone}`);
  console.log(`   OPD Fees    : ₹${doctor.opdFees}`);
  console.log(`   Slots       : ${doctor.slots.length} available`);

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
