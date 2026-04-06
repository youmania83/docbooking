import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocBooking.in - Book Doctor Appointments in Panipat",
  description:
    "Skip OPD Queues in Panipat - Book doctor appointments instantly and avoid long waiting times",
  icons: {
    icon: "/logos/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/logos/docbooking-logo-horizontal.svg"
                alt="DocBooking"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm text-gray-600">Panipat, India</p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
