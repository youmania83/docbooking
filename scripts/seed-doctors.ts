import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

const seedDoctors = async () => {
  try {
    await connectDB();

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log("✅ Cleared existing doctors");

    const doctors = [
      {
        name: "Dr. Tushar Kalra",
        qualification: "MD, MBBS",
        experience: "15 years",
        specialty: "General Physician",
        address: "Kalra Clinic, Railway Road, Panipat",
        googleLocation: "https://maps.google.com/?q=kalra+clinic+panipat",
        phone: "+91 9876543210",
        opdFees: 300,
        slots: ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:30 PM"],
      },
      {
        name: "Dr. Ashootosh Kalra",
        qualification: "MS, MBBS",
        experience: "18 years",
        specialty: "Surgeon",
        address: "Ashootosh Hospital, GT Road, Panipat",
        googleLocation: "https://maps.google.com/?q=ashootosh+hospital+panipat",
        phone: "+91 9876543211",
        opdFees: 500,
        slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "5:30 PM"],
      },
      {
        name: "Dr. Keerat Kalra",
        qualification: "DGO, MBBS",
        experience: "12 years",
        specialty: "Gynecologist",
        address: "Keerat Women's Clinic, Model Town, Panipat",
        googleLocation: "https://maps.google.com/?q=keerat+clinic+panipat",
        phone: "+91 9876543212",
        opdFees: 400,
        slots: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"],
      },
      {
        name: "Dr. Pankaj Bajaj",
        qualification: "DNB, MBBS",
        experience: "14 years",
        specialty: "Orthopedic",
        address: "Bajaj Bone Clinic, Industrial Area, Panipat",
        googleLocation: "https://maps.google.com/?q=bajaj+clinic+panipat",
        phone: "+91 9876543213",
        opdFees: 600,
        slots: ["9:30 AM", "11:30 AM", "1:30 PM", "3:30 PM", "5:00 PM"],
      },
      {
        name: "Dr. Priya Singh",
        qualification: "MD, Pediatrics",
        experience: "10 years",
        specialty: "Pediatrician",
        address: "Singh Pediatric Care, City Center, Panipat",
        googleLocation: "https://maps.google.com/?q=singh+pediatric+panipat",
        phone: "+91 9876543214",
        opdFees: 350,
        slots: ["8:00 AM", "10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
      },
      {
        name: "Dr. Rajesh Kumar",
        qualification: "MD, Cardiology",
        experience: "16 years",
        specialty: "Cardiologist",
        address: "Kumar Heart Care, Highway Road, Panipat",
        googleLocation: "https://maps.google.com/?q=kumar+cardiology+panipat",
        phone: "+91 9876543215",
        opdFees: 700,
        slots: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
      },
    ];

    const createdDoctors = await Doctor.insertMany(doctors);
    console.log(`✅ Successfully seeded ${createdDoctors.length} doctors`);

    createdDoctors.forEach((doc) => {
      console.log(`   • ${doc.name} (${doc.specialty}) - ₹${doc.opdFees}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding doctors:", error);
    process.exit(1);
  }
};

seedDoctors();
