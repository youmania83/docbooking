import { SPECIALTIES, LOCATIONS, HOMEPAGE_FAQ, SITE_URL } from "@/lib/seo-data";

interface JsonLdSchemaProps {
  page?: "home" | "doctors" | "doctor" | "specialty" | "location";
  doctorData?: {
    name: string;
    specialty: string;
    opdFees: number;
    address: string;
    qualification?: string;
    uid?: string;
  };
  specialtyData?: {
    name: string;
    slug: string;
    minFee: number;
    maxFee: number;
  };
  locationData?: {
    city: string;
    state: string;
  };
  includeFaq?: boolean;
}

export default function JsonLdSchema({
  page = "home",
  doctorData,
  specialtyData,
  locationData,
  includeFaq = false,
}: JsonLdSchemaProps) {
  const schemas: object[] = [];

  // LocalBusiness + MedicalOrganization for all pages
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MedicalOrganization"],
    "@id": `${SITE_URL}/#organization`,
    name: "DocBooking",
    url: SITE_URL,
    logo: `${SITE_URL}/logos/docbooking-logo-primary.svg`,
    description:
      "DocBooking is an India-focused doctor discovery and appointment booking platform. Find verified doctors in Panipat by specialty and book OPD appointments online, instantly.",
    areaServed: LOCATIONS.map((l) => ({
      "@type": "City",
      name: l.city,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Medical Specialties",
      itemListElement: SPECIALTIES.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "MedicalSpecialty",
          name: s.name,
        },
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: s.minFee,
          maxPrice: s.maxFee,
          priceCurrency: "INR",
        },
      })),
    },
    priceRange: "₹100-₹2000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Panipat",
      addressRegion: "Haryana",
      addressCountry: "IN",
    },
    sameAs: [SITE_URL],
  };
  schemas.push(organizationSchema);

  // Website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "DocBooking",
    description: "Book doctor appointments online in Panipat, India",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/doctors?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  schemas.push(websiteSchema);

  // FAQ schema
  if (includeFaq) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOMEPAGE_FAQ.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
    schemas.push(faqSchema);
  }

  // Doctor profile schema
  if (page === "doctor" && doctorData) {
    const doctorSchema = {
      "@context": "https://schema.org",
      "@type": "Physician",
      name: doctorData.name,
      medicalSpecialty: doctorData.specialty,
      url: `${SITE_URL}/doctor/${doctorData.uid}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: doctorData.address,
        addressLocality: "Panipat",
        addressRegion: "Haryana",
        addressCountry: "IN",
      },
      priceRange: `₹${doctorData.opdFees}`,
    };
    schemas.push(doctorSchema);
  }

  // Specialty page breadcrumb
  if (page === "specialty" && specialtyData) {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `${specialtyData.name} Doctors`,
          item: `${SITE_URL}/specialties/${specialtyData.slug}`,
        },
      ],
    };
    schemas.push(breadcrumbSchema);
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
