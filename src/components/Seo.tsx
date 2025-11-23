import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  noIndex?: boolean;
  includeOrganization?: boolean;
  includeLocalBusiness?: boolean;
}

export default function Seo({ 
  title, 
  description, 
  canonicalUrl, 
  jsonLd, 
  noIndex,
  includeOrganization = false,
  includeLocalBusiness = false
}: SeoProps) {
  useEffect(() => {
    // Title
    if (title) document.title = title;

    // Meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    // Canonical
    const href = canonicalUrl || window.location.href;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);

    // Robots
    if (typeof noIndex === "boolean") {
      let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = noIndex ? "noindex, nofollow" : "index, follow";
    }

    // Structured data - handle both single schema and array of schemas
    const scriptId = "seo-json-ld";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      
      // If it's an array of schemas, wrap in @graph
      const schemaData = Array.isArray(jsonLd) 
        ? { "@context": "https://schema.org", "@graph": jsonLd }
        : jsonLd;
      
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    return () => {
      // Clean up JSON-LD on unmount to avoid duplicates when navigating
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, canonicalUrl, JSON.stringify(jsonLd), noIndex, includeOrganization, includeLocalBusiness]);

  return null;
}
