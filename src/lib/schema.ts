// Schema.org markup generators for SEO

const BUSINESS_INFO = {
  name: "404 Code Lab",
  legalName: "404 Code Lab",
  url: "https://404codelab.com",
  logo: "https://404codelab.com/assets/logo-dark.png",
  image: "https://404codelab.com/assets/logo-dark.png",
  telephone: "+44-7864-502527",
  email: "hello@404codelab.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Central Scotland",
    addressLocality: "Edinburgh",
    addressRegion: "Scotland",
    postalCode: "EH",
    addressCountry: "GB"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 55.9533,
    longitude: -3.1883
  },
  priceRange: "££-£££",
  description: "Professional web development, mobile app development, and game development services in Scotland's Central Belt. Serving Edinburgh, Glasgow, and businesses across Scotland.",
  foundingDate: "2020",
  areaServed: [
    { "@type": "City", name: "Edinburgh" },
    { "@type": "City", name: "Glasgow" },
    { "@type": "City", name: "Stirling" },
    { "@type": "City", name: "Falkirk" },
    { "@type": "City", name: "Livingston" },
    { "@type": "State", name: "Scotland" },
    { "@type": "Country", name: "United Kingdom" }
  ]
};

const SOCIAL_PROFILES = {
  sameAs: [
    "https://www.linkedin.com/company/404codelab",
    "https://twitter.com/404codelab",
    "https://github.com/404codelab",
    "https://www.facebook.com/404codelab"
  ]
};

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    ...BUSINESS_INFO,
    ...SOCIAL_PROFILES,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00"
      }
    ]
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    ...BUSINESS_INFO,
    ...SOCIAL_PROFILES,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "47",
      bestRating: "5",
      worstRating: "1"
    }
  };
}

export function generateServiceSchema(service: {
  name: string;
  description: string;
  serviceType: string;
  areaServed?: string[];
  offers?: {
    name: string;
    price: string;
    priceCurrency?: string;
  }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.serviceType,
    name: service.name,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.telephone,
      email: BUSINESS_INFO.email,
      address: BUSINESS_INFO.address
    },
    areaServed: service.areaServed || BUSINESS_INFO.areaServed,
    ...(service.offers && {
      offers: service.offers.map(offer => ({
        "@type": "Offer",
        name: offer.name,
        price: offer.price,
        priceCurrency: offer.priceCurrency || "GBP"
      }))
    })
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function generateReviewSchema(review: {
  author: string;
  reviewBody: string;
  rating: number;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "LocalBusiness",
      name: BUSINESS_INFO.name,
      image: BUSINESS_INFO.image,
      telephone: BUSINESS_INFO.telephone,
      address: BUSINESS_INFO.address
    },
    author: {
      "@type": "Person",
      name: review.author
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished || new Date().toISOString().split('T')[0]
  };
}

export function generateWebPageSchema(page: {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: { name: string; url: string }[];
}) {
  const schemas: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.name,
      description: page.description,
      url: page.url,
      isPartOf: {
        "@type": "WebSite",
        name: BUSINESS_INFO.name,
        url: BUSINESS_INFO.url
      },
      publisher: {
        "@type": "Organization",
        name: BUSINESS_INFO.name,
        logo: {
          "@type": "ImageObject",
          url: BUSINESS_INFO.logo
        }
      }
    }
  ];

  if (page.breadcrumbs && page.breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(page.breadcrumbs));
  }

  return schemas;
}

// Service-specific schemas
export const WEB_DEVELOPMENT_SERVICE = {
  name: "Web Development",
  description: "Custom website and web application development services in Edinburgh, Glasgow, and across Scotland's Central Belt. Responsive design, e-commerce, and progressive web apps.",
  serviceType: "Web Development",
  areaServed: ["Edinburgh", "Glasgow", "Scotland", "United Kingdom"],
  offers: [
    { name: "Landing Page", price: "2999", priceCurrency: "GBP" },
    { name: "Business Website", price: "5999", priceCurrency: "GBP" },
    { name: "Custom Web App", price: "12999", priceCurrency: "GBP" }
  ]
};

export const APP_DEVELOPMENT_SERVICE = {
  name: "Mobile App Development",
  description: "Professional iOS and Android app development for Edinburgh and Glasgow businesses. React Native, native development, and custom mobile solutions.",
  serviceType: "Mobile Application Development",
  areaServed: ["Edinburgh", "Glasgow", "Scotland", "United Kingdom"],
  offers: [
    { name: "MVP App", price: "15999", priceCurrency: "GBP" },
    { name: "Growth App", price: "29999", priceCurrency: "GBP" },
    { name: "Enterprise App", price: "50999", priceCurrency: "GBP" }
  ]
};

export const GAME_DEVELOPMENT_SERVICE = {
  name: "Game Development",
  description: "Custom game development services for mobile, web, and desktop platforms. From casual mobile games to complex gaming experiences.",
  serviceType: "Game Development",
  areaServed: ["Edinburgh", "Glasgow", "Scotland", "United Kingdom", "International"],
  offers: [
    { name: "Mobile Game", price: "20000", priceCurrency: "GBP" },
    { name: "Web Game", price: "15000", priceCurrency: "GBP" }
  ]
};

export const AI_INTEGRATION_SERVICE = {
  name: "AI Integration",
  description: "Artificial intelligence and machine learning integration services for Scottish businesses. Chatbots, automation, and custom AI solutions.",
  serviceType: "AI Integration Services",
  areaServed: ["Edinburgh", "Glasgow", "Scotland", "United Kingdom"],
  offers: [
    { name: "AI Chatbot", price: "8999", priceCurrency: "GBP" },
    { name: "AI Automation Suite", price: "19999", priceCurrency: "GBP" },
    { name: "Enterprise AI", price: "39999", priceCurrency: "GBP" }
  ]
};
