import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Smartphone, Zap, Users, Star, Code, Palette, Play, Store } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, APP_DEVELOPMENT_SERVICE } from "@/lib/schema";

export default function AppsLanding() {
  const schemas = [
    generateServiceSchema(APP_DEVELOPMENT_SERVICE),
    generateBreadcrumbSchema([
      { name: "Home", url: "https://404codelab.com" },
      { name: "Mobile App Development", url: "https://404codelab.com/services/mobile-apps" }
    ])
  ];
  
  return (
    <EnhancedLandingTemplate
      title="Mobile App Development"
      subtitle="Create Apps That Users Love"
      intro="From concept to App Store success, we build beautiful, high-performance mobile apps that engage users and drive business growth. Serving Edinburgh, Glasgow, and across Scotland's Central Belt with native quality and cross-platform efficiency."
      icon={<Smartphone className="h-4 w-4" />}
      
      heroStats={[
        { label: "Apps Launched", value: "80+" },
        { label: "Average Rating", value: "4.7★" },
        { label: "Total Downloads", value: "2M+" },
        { label: "User Retention", value: "75%" }
      ]}
      
      features={[
        "Native iOS & Android development",
        "Cross-platform React Native apps",
        "Beautiful UX/UI design",
        "Secure user authentication",
        "In-app purchases & payments",
        "Push notifications & messaging",
        "Offline functionality",
        "App Store optimization"
      ]}
      
      benefits={[
        "Reach millions of mobile users",
        "Save 40% on development costs",
        "Increase user engagement by 60%",
        "Build trust with secure features",
        "Generate revenue from day one",
        "Keep users coming back",
        "Work without internet connection",
        "Rank higher in app stores"
      ]}
      
      techStack={[
        "React Native", "Swift", "Kotlin", "Flutter", "Firebase", 
        "Expo", "Redux", "GraphQL", "AWS Amplify", "App Store Connect"
      ]}
      
      useCases={[
        { 
          title: "Marketplace App", 
          text: "Complete buying and selling platform with listings, search, secure payments, and in-app messaging.", 
          image: "/lovable-uploads/0f5fc07e-8b2a-49a3-b4d4-1e7a3adb62b1.png",
          metrics: "50K+ downloads in first month"
        },
        { 
          title: "Fitness & Wellness", 
          text: "Personalized workout plans, progress tracking, social features, and gamification to keep users motivated.", 
          image: "/lovable-uploads/daa01be4-d91d-4d88-bec9-e9a2e01383a5.png",
          metrics: "85% monthly active users"
        },
        { 
          title: "Productivity Suite", 
          text: "Task management, calendar integration, team collaboration, and smart notifications for maximum efficiency.", 
          image: "/lovable-uploads/08b142ce-467d-4503-aa9d-28d4085bbf3b.png",
          metrics: "40% productivity increase"
        },
      ]}
      
      testimonials={[
        {
          name: "James Park",
          company: "FitLife Startup",
          content: "Our fitness app has 100K+ users and growing! The team delivered beyond expectations with amazing UX and rock-solid performance.",
          rating: 5
        },
        {
          name: "Lisa Thompson",
          company: "ShopLocal Marketplace",
          content: "The marketplace app they built generated $500K in transactions in the first 6 months. The user experience is incredible.",
          rating: 5
        },
        {
          name: "David Kim",
          company: "TaskMaster Pro",
          content: "From MVP to 50K downloads in 3 months. The app runs smoothly across all devices and the analytics are impressive.",
          rating: 5
        }
      ]}
      
      pricing={[
        {
          name: "MVP App",
          price: "$15,999",
          period: "project",
          description: "Perfect for validating your app idea and getting to market fast",
          features: [
            "Core functionality (3-5 features)",
            "iOS & Android deployment",
            "Basic user authentication",
            "App Store submission",
            "6 weeks delivery",
            "3 months support"
          ]
        },
        {
          name: "Growth App",
          price: "$29,999",
          period: "project",
          description: "Full-featured app with advanced functionality and integrations",
          features: [
            "Everything in MVP",
            "Advanced features (8-12)",
            "Payment integration",
            "Push notifications",
            "Analytics dashboard",
            "12 weeks delivery"
          ],
          popular: true
        },
        {
          name: "Enterprise App",
          price: "$50,999+",
          period: "project",
          description: "Complex apps with custom features and enterprise integrations",
          features: [
            "Unlimited custom features",
            "Enterprise integrations",
            "Advanced security",
            "Admin dashboard",
            "White-label options",
            "Dedicated support"
          ]
        }
      ]}
      
      process={[
        {
          title: "Strategy",
          description: "Market research, user personas, and feature prioritization to ensure product-market fit.",
          icon: <Users className="h-8 w-8 text-primary" />
        },
        {
          title: "Design",
          description: "Wireframes, prototypes, and pixel-perfect UI/UX that users will love.",
          icon: <Palette className="h-8 w-8 text-primary" />
        },
        {
          title: "Development",
          description: "Native-quality code with cross-platform efficiency and rigorous testing.",
          icon: <Code className="h-8 w-8 text-primary" />
        },
        {
          title: "Launch",
          description: "App Store optimisation, submission, and ongoing support for success.",
          icon: <Store className="h-8 w-8 text-primary" />
        }
      ]}
      
      faq={[
        {
          question: "How much does it cost to develop a mobile app?",
          answer: "App development costs vary based on complexity. Simple apps start at $15,999, while complex enterprise apps can cost $50,999+. We'll provide a detailed quote after understanding your requirements."
        },
        {
          question: "How long does it take to build an app?",
          answer: "Development time depends on features and complexity. MVP apps take 6-8 weeks, full-featured apps take 12-16 weeks, and enterprise apps can take 20+ weeks."
        },
        {
          question: "Do you build for both iOS and Android?",
          answer: "Yes! We specialise in cross-platform development using React Native, which allows us to build for both platforms efficiently while maintaining native performance."
        },
        {
          question: "Will you help with App Store submission?",
          answer: "Absolutely! We handle the entire App Store and Google Play submission process, including optimisation, screenshots, descriptions, and compliance with store guidelines."
        }
      ]}
      
      ctaLabel="Start Your App Project"
      secondaryCtaLabel="View App Portfolio"
      secondaryCtaHref="/app-portfolio"
      
      seo={{
        title: "Mobile App Development Edinburgh & Glasgow | Scotland | 404 Code Lab",
        description: "Professional mobile app development across Scotland's Central Belt. iOS & Android apps for Edinburgh, Glasgow, and Scottish businesses. React Native, native development, UI/UX design. Get your quote!",
        jsonLd: schemas
      }}
    />
  );
}
