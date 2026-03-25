import { Helmet } from 'react-helmet-async';

export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "TunzaConnect ",
    "image": "https://res.cloudinary.com/dmpcgydyf/image/upload/v1771566755/landing-pages/careconnectlogo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Area 58",
      "addressLocality": "Nairobi",
      "addressRegion": "Central Region",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -13.9626,
      "longitude": 33.7741
    },
    "url": "https://tunzaconnect.com",
    "telephone": "+265 986 227 240",
    "email": "support@tunzaconnect.com",
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    "areaServed": [
      {"@type": "City", "name": "Nairobi"},
      {"@type": "City", "name": "Mombasa"},
      {"@type": "City", "name": "Kisumu"}
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
