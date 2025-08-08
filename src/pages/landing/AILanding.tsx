import LandingTemplate from "./LandingTemplate";

export default function AILanding() {
  return (
    <LandingTemplate
      title="AI Integration"
      intro="Integrate AI chatbots, automation, and analytics into your product to improve support, efficiency, and conversion."
      features={[
        "AI chatbots and in-app assistants",
        "Process automation across your tools",
        "Data analysis and predictive insights",
        "Personalised recommendations",
      ]}
      useCases={[
        { title: "AI support assistant", text: "Resolve common tickets instantly with your knowledge base.", image: "/lovable-uploads/4a5f1662-f838-4873-8197-031303c450d6.png" },
        { title: "Smart recommendations", text: "Personalise content and offers to each user.", image: "/lovable-uploads/dd670ca4-826a-4160-ab5e-3087f16b0177.png" },
        { title: "Workflow automation", text: "Trigger tasks and sync data between tools.", image: "/lovable-uploads/5deb9273-b749-4781-803a-ac052ba93374.png" },
      ]}
      seo={{
        title: "AI Integration Landing | 404 Code Lab",
        description: "Chatbots, automation, and predictive analytics integrated into your product.",
      }}
    />
  );
}
