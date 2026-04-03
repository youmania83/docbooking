#!/bin/bash

# Doctor Booking - Complete Setup Script
# This script sets up MongoDB connection and seeds the database

set -e

echo "🚀 DocBooking Setup Script"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local file not found!"
  echo "Please create .env.local with your MongoDB URI:"
  echo ""
  echo "MONGODB_URI=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/docbooking?retryWrites=true&w=majority"
  exit 1
fi

# Check if MONGODB_URI is set
if ! grep -q "MONGODB_URI" .env.local; then
  echo "❌ MONGODB_URI not found in .env.local"
  exit 1
fi

echo "✅ MongoDB URI configured"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Build Next.js
echo "🔨 Building Next.js..."
npm run build
echo "✅ Build complete"
echo ""

# Seed database
echo "🌱 Seeding database with sample doctors..."
npx ts-node scripts/seed-doctors.ts
echo "✅ Database seeded"
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "You can now start development:"
echo "  npm run dev"
echo ""
echo "Then visit:"
echo "  • http://localhost:3000 - Home"
echo "  • http://localhost:3000/admin - Add doctors"
echo "  • http://localhost:3000/doctors - View doctors"
