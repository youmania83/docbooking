import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    console.log("📥 GET /api/doctors - Request received");

    // Connect to database
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();
    console.log("✓ MongoDB connected");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const specialty = searchParams.get("specialty");
    const name = searchParams.get("name");

    console.log(`📋 Search params - ID: ${id}, Specialty: ${specialty}, Name: ${name}`);

    let query = {};

    // If ID is provided, fetch specific doctor
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`⚠️ Invalid ObjectId: ${id}`);
        return NextResponse.json(
          {
            success: false,
            message: "Invalid doctor ID format",
          },
          { status: 400 }
        );
      }
      query = { _id: new mongoose.Types.ObjectId(id) };
    } else {
      // Otherwise apply filters
      if (specialty) {
        query = { ...query, specialty: { $regex: specialty, $options: "i" } };
      }

      if (name) {
        query = { ...query, name: { $regex: name, $options: "i" } };
      }
    }

    console.log(`🔍 Query object:`, JSON.stringify(query));

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });

    console.log(`✓ Found ${doctors.length} doctor(s)`);

    const response = NextResponse.json(
      {
        success: true,
        data: doctors,
        count: doctors.length,
      },
      { status: 200 }
    );

    // Add cache headers for performance
    // Cache for 60 seconds for search queries, 120 seconds for full list
    const cacheTime = query && Object.keys(query).length > 0 ? 60 : 120;
    response.headers.set("Cache-Control", `public, max-age=${cacheTime}, s-maxage=${cacheTime}`);
    
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ GET /api/doctors error:", errorMessage);
    console.error("Full error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error fetching doctors",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📥 POST /api/doctors - Request received");

    console.log("🔗 Connecting to MongoDB...");
    await connectDB();
    console.log("✓ MongoDB connected");

    const body = await request.json();
    console.log(`📝 Request body:`, {
      name: body.name,
      specialty: body.specialty,
      opdFees: body.opdFees,
    });

    const {
      name,
      qualification,
      experience,
      address,
      googleLocation,
      phone,
      opdFees,
      specialty,
      slots,
    } = body;

    // Validation
    if (
      !name ||
      !qualification ||
      !experience ||
      !address ||
      !googleLocation ||
      !phone ||
      opdFees === undefined ||
      !specialty
    ) {
      console.warn("⚠️ Missing required fields in request");
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    console.log(`✓ Validation passed, creating doctor: ${name}`);

    const newDoctor = await Doctor.create({
      name,
      qualification,
      experience,
      address,
      googleLocation,
      phone,
      opdFees: Number(opdFees),
      specialty,
      slots: slots || [],
    });

    console.log(`✓ Doctor created successfully: ${newDoctor._id}`);

    return NextResponse.json(
      {
        success: true,
        data: newDoctor,
        message: "Doctor added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ POST /api/doctors error:", errorMessage);
    console.error("Full error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error creating doctor",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
