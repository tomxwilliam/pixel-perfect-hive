import LandingTemplate from "./LandingTemplate";

export default function WebLanding() {
  return (
    <LandingTemplate
      title="Web Development"
      intro="Modern, fast, SEO-friendly websites and web apps engineered for conversion and performance."
      features={[
        "Responsive UI with accessible components",
        "CMS integrations and dynamic content",
        "SEO best practices and analytics",
        "Third-party API integrations",
      ]}
      useCases={[
        { title: "SaaS dashboard", text: "Real-time charts, auth, and role-based access.", image: "/lovable-uploads/c4140cc5-49a7-448f-a499-fa51ef6ff6c9.png" },
        { title: "Marketing site", text: "High Lighthouse scores and clean CMS workflows.", image: "/lovable-uploads/ae042420-8758-4f7f-89c6-368216ad3dd5.png" },
        { title: "Client portal", text: "Secure areas, billing, and messaging.", image: "/lovable-uploads/e8dbb82e-a966-421f-82ba-b83542109f76.png" },
      ]}
      seo={{
        title: "Web Development Landing | 404 Code Lab",
        description: "High-performance web apps and sites with SEO and integrations.",
      }}
    />
  );
}
