import { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { SPECIALTIES, LOCATIONS, SPECIALTY_LOCATION_PAGES, SITE_URL } from "@/lib/seo-data";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/doctors`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/booking`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-and-conditions`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cancellation-policy`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund-policy`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Specialty pages
  const specialtyPages: MetadataRoute.Sitemap = SPECIALTIES.map((s) => ({
    url: `${SITE_URL}/specialties/${s.slug}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Location pages
  const locationPages: MetadataRoute.Sitemap = LOCATIONS.map((l) => ({
    url: `${SITE_URL}/locations/${l.slug}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Specialty + Location combo pages
  const specialtyLocationPages: MetadataRoute.Sitemap = SPECIALTY_LOCATION_PAGES.map((p) => ({
    url: `${SITE_URL}/${p.route}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Dynamic doctor pages from database
  let doctorPages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const doctors = await Doctor.find().select("uid _id updatedAt").lean();
    doctorPages = doctors.map((doc: any) => ({
      url: `${SITE_URL}/doctor/${doc.uid || doc._id.toString()}`,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : today,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // Return without doctor pages if DB unavailable
  }

  return [
    ...staticPages,
    ...specialtyPages,
    ...locationPages,
    ...specialtyLocationPages,
    ...doctorPages,
  ];
}
