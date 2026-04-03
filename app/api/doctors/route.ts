import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const specialty = searchParams.get("specialty");
    const name = searchParams.get("name");

    let query = {};

    // If ID is provided, fetch specific doctor
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid doctor ID",
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

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: doctors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching doctors",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

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
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

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

    return NextResponse.json(
      {
        success: true,
        data: newDoctor,
        message: "Doctor added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating doctor",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
