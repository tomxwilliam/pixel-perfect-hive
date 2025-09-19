import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Smartphone, Star, TrendingUp, Zap, Users, Palette, Code, Play } from "lucide-react";
import Seo from "@/components/Seo";

export default function AppDevelopment() {
  const seoData = {
    title: "Mobile App Development Services | iOS & Android Apps | 404 Code Lab", 
    description: "Professional mobile app development for iOS and Android. Custom native and cross-platform apps built with React Native, Swift, and Kotlin. From concept to App Store.",
    canonicalUrl: "https://404codelab.com/services/app-development"
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mobile App Development Services",
    "provider": { "@type": "Organization", "name": "404 Code Lab" },
    "areaServed": "Global", 
    "serviceType": "Mobile App Development",
    "description": seoData.description
  };

  return (
    <>
      <Seo {...seoData} jsonLd={jsonLd} />
      <EnhancedLandingTemplate
        title="Mobile App Development"
        subtitle="Native & Cross-Platform Apps That Users Love"
        intro="From startup MVPs to enterprise solutions, we build mobile apps that engage users and drive business growth. Beautiful interfaces, seamless performance, and smart functionality."
        icon={<Smartphone className="h-4 w-4" />}
        
        heroStats={[
          { label: "Apps Published", value: "150+" },
          { label: "Total Downloads", value: "10M+" },
          { label: "Average Rating", value: "4.7★" },
          { label: "Client Success Rate", value: "95%" }
        ]}
        
        features={[
          "Native iOS & Android development",
          "Cross-platform React Native apps", 
          "Modern UI/UX design",
          "Backend API integration",
          "Push notifications & messaging",
          "In-app purchases & subscriptions",
          "Analytics & crash reporting",
          "App Store optimization"
        ]}
        
        benefits={[
          "Reach millions of mobile users",
          "Increase customer engagement", 
          "Generate new revenue streams",
          "Improve brand accessibility",
          "Gather valuable user insights",
          "Automate business processes",
          "Scale globally with ease",
          "Stay ahead of competitors"
        ]}
        
        techStack={[
          "React Native", "Swift", "Kotlin", "Flutter", "Expo",
          "Firebase", "AWS", "TypeScript", "Redux", "App Store Connect"
        ]}
        
        useCases={[
          {
            title: "E-commerce Mobile App",
            text: "Feature-rich shopping app with product catalogs, secure payments, and personalized recommendations.",
            image: "/lovable-uploads/1e963e0b-cd28-4c9f-a4ee-0efb51b7c7fa.png",
            metrics: "500K+ downloads in first year"
          },
          {
            title: "Social Networking App", 
            text: "Community-focused platform with real-time messaging, content sharing, and engagement features.",
            image: "/lovable-uploads/ae042420-8758-4f7f-89c6-368216ad3dd5.png",
            metrics: "1M+ monthly active users"
          },
          {
            title: "Business Productivity App",
            text: "Streamlined workflow management with team collaboration, task tracking, and reporting tools.",
            image: "/lovable-uploads/c4140cc5-49a7-448f-a499-fa51ef6ff6c9.png", 
            metrics: "85% improvement in team efficiency"
          }
        ]}
        
        testimonials={[
          {
            name: "David Rodriguez",
            company: "FinTech Startup",
            content: "Our app reached #1 in Finance category! The user experience is incredible and performance is flawless.",
            rating: 5
          },
          {
            name: "Lisa Thompson",
            company: "Healthcare Provider", 
            content: "The patient app they built streamlined our operations and improved satisfaction scores by 40%.",
            rating: 5
          },
          {
            name: "James Park",
            company: "Retail Chain",
            content: "Mobile sales increased 300% after launching our custom shopping app. ROI exceeded expectations.",
            rating: 5
          }
        ]}
        
        pricing={[
          {
            name: "MVP App",
            price: "$19,999",
            period: "project",
            description: "Perfect for startups and new product launches",
            features: [
              "Single platform (iOS or Android)",
              "Core functionality",
              "Modern UI design", 
              "Basic backend integration",
              "App store submission",
              "12 weeks delivery"
            ]
          },
          {
            name: "Professional App",
            price: "$39,999", 
            period: "project",
            description: "Full-featured apps for established businesses",
            features: [
              "Cross-platform (iOS & Android)",
              "Advanced features & integrations",
              "Custom backend development",
              "Push notifications",
              "Analytics & reporting",
              "16 weeks delivery"
            ],
            popular: true
          },
          {
            name: "Enterprise Solution", 
            price: "$79,999+",
            period: "project",
            description: "Complex apps with enterprise-grade features",
            features: [
              "Everything in Professional",
              "Advanced security & compliance",
              "API integrations & microservices", 
              "Advanced admin panels",
              "Ongoing maintenance included",
              "Custom timeline"
            ]
          }
        ]}
        
        process={[
          {
            title: "Strategy",
            description: "App concept validation, market research, and feature planning for maximum impact.",
            icon: <Users className="h-8 w-8 text-primary" />
          },
          {
            title: "Design", 
            description: "User experience design, interface creation, and interactive prototyping.",
            icon: <Palette className="h-8 w-8 text-primary" />
          },
          {
            title: "Development",
            description: "Native or cross-platform development with rigorous testing and optimization.",
            icon: <Code className="h-8 w-8 text-primary" />
          },
          {
            title: "Launch",
            description: "App store submission, marketing assets, and user acquisition strategy.",
            icon: <Play className="h-8 w-8 text-primary" />
          }
        ]}
        
        faq={[
          {
            question: "Should I build native or cross-platform?",
            answer: "It depends on your goals and budget. Native apps offer the best performance and platform-specific features, while cross-platform saves time and cost. We'll recommend the best approach based on your requirements."
          },
          {
            question: "How long does app development take?",
            answer: "MVP apps typically take 12-16 weeks, professional apps take 16-24 weeks, and complex enterprise solutions can take 6+ months. Timeline depends on features and complexity."
          },
          {
            question: "Do you handle App Store submission?",
            answer: "Yes! We manage the complete App Store and Google Play submission process, including creating store listings, handling reviews, and ensuring compliance with store guidelines."
          },
          {
            question: "What about app maintenance and updates?",
            answer: "We provide ongoing maintenance packages including bug fixes, OS compatibility updates, feature enhancements, and performance monitoring to keep your app running smoothly."
          }
        ]}
        
        ctaLabel="Start Your App Project"
        secondaryCtaLabel="View App Portfolio" 
        secondaryCtaHref="/portfolio/apps"
        
        seo={{
          title: seoData.title,
          description: seoData.description,
        }}
      />
    </>
  );
}