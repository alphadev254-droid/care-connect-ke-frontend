// Structured Data (Schema.org) for SEO

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "TunzaConnect ",
  "description": "Professional home healthcare services connecting patients with verified caregivers across all regions of Kenya",
  "url": "https://tunzaconnect.com",
  "logo": "https://res.cloudinary.com/dmpcgydyf/image/upload/v1771566755/landing-pages/tunzaconnectlogo.png",
  "telephone": "+265986227240",
  "email": "support@tunzaconnect.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Area 58",
    "addressLocality": "Lilongwe",
    "addressRegion": "Central Region",
    "addressCountry": "MW"
  },
  "areaServed": [
    {
      "@type": "Country",
      "name": "Kenya"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Northern Region, Kenya"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Central Region, Kenya"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Southern Region, Kenya"
    }
  ],
  "sameAs": [
    "https://tunzaconnect.com"
  ],
  "priceRange": "$$",
  "openingHours": "Mo-Su 00:00-23:59"
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const serviceSchema = (serviceName: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "MedicalProcedure",
  "name": serviceName,
  "description": description,
  "provider": {
    "@type": "MedicalBusiness",
    "name": "TunzaConnect ",
    "telephone": "+265986227240"
  }
});

export const personSchema = (caregiver: {
  name: string;
  bio: string;
  qualifications: string;
  experience: number;
  hourlyRate: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": caregiver.name,
  "description": caregiver.bio,
  "jobTitle": "Healthcare Caregiver",
  "hasCredential": caregiver.qualifications,
  "yearsOfExperience": caregiver.experience,
  "priceRange": `Ksh ${caregiver.hourlyRate}/hour`
});

export const reviewSchema = (reviews: {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}[]) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TunzaConnect ",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    "reviewCount": reviews.length
  },
  "review": reviews.map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating
    },
    "reviewBody": review.reviewBody,
    "datePublished": review.datePublished
  }))
});

export const localBusinessSchema = (location: {
  name: string;
  address: string;
  city: string;
  region: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": `TunzaConnect  - ${location.city}`,
  "description": `Professional home healthcare services in ${location.city}, Kenya. Connecting patients with verified caregivers for quality home care.`,
  "telephone": "+254986227240",
  "email": "support@tunzaconnect.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": location.address,
    "addressLocality": location.city,
    "addressRegion": location.region,
    "addressCountry": "KE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": location.city === "Lilongwe" ? "-13.9626" : location.city === "Blantyre" ? "-15.7861" : "-11.4593",
    "longitude": location.city === "Lilongwe" ? "33.7741" : location.city === "Blantyre" ? "35.0058" : "34.0151"
  },
  "openingHours": "Mo-Su 00:00-23:59",
  "priceRange": "$$"
});
