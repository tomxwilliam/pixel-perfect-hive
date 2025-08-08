import LandingTemplate from "./LandingTemplate";

export default function GamesLanding() {
  return (
    <LandingTemplate
      title="Mobile Game Development"
      intro="We design and build engaging mobile games with addictive loops, polished UX, and analytics baked in."
      features={[
        "Full-cycle development: concept, art, gameplay, launch",
        "Balanced monetisation: IAP, ads, rewarded video",
        "Live ops, analytics, and A/B testing",
        "Cross-platform delivery (iOS, Android)",
      ]}
      useCases={[
        { title: "Idle clicker", text: "Retention-focused loops with events and progression.", image: "/lovable-uploads/40db8b65-10fc-4b8a-bdbe-0c197159ca3a.png" },
        { title: "Puzzle", text: "Satisfying mechanics with beautiful visuals.", image: "/lovable-uploads/9bf1d85f-9e5f-4fb0-9ce8-f74db644a586.png" },
        { title: "Arcade", text: "Fast-to-fun gameplay with social features.", image: "/lovable-uploads/de1286a6-6683-4438-a78c-c5995a51478e.png" },
      ]}
      seo={{
        title: "Mobile Game Development Landing | 404 Code Lab",
        description: "High-quality mobile games with analytics and monetisation. iOS & Android.",
      }}
    />
  );
}
