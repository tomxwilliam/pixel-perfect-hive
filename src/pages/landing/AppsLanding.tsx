import LandingTemplate from "./LandingTemplate";

export default function AppsLanding() {
  return (
    <LandingTemplate
      title="Custom App Development"
      intro="Launch fast with robust, scalable apps. Pixel-perfect UI, secure backends, and seamless integrations."
      features={[
        "UX/UI design and prototyping",
        "Auth, payments, notifications",
        "API integrations and data sync",
        "App Store/Play deployment and support",
      ]}
      useCases={[
        { title: "Marketplace app", text: "Listings, search, checkout, and messaging.", image: "/lovable-uploads/0f5fc07e-8b2a-49a3-b4d4-1e7a3adb62b1.png" },
        { title: "Wellness app", text: "Programs, reminders, and progress tracking.", image: "/lovable-uploads/daa01be4-d91d-4d88-bec9-e9a2e01383a5.png" },
        { title: "Productivity app", text: "Offline-first tasks and smart scheduling.", image: "/lovable-uploads/08b142ce-467d-4503-aa9d-28d4085bbf3b.png" },
      ]}
      seo={{
        title: "Custom App Development Landing | 404 Code Lab",
        description: "Design and build mobile apps with secure auth, payments, and integrations.",
      }}
    />
  );
}
