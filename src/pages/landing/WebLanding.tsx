import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Globe, Search, Smartphone, Zap, Code, Palette, Users, Calendar } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, WEB_DEVELOPMENT_SERVICE } from "@/lib/schema";

export default function WebLanding() {
  const schemas = [
    generateServiceSchema(WEB_DEVELOPMENT_SERVICE),
    generateBreadcrumbSchema([
      { name: "Home", url: "https://404codelab.com" },
      { name: "Web Development", url: "https://404codelab.com/services/web-development" }
    ])
  ];
  
  return (
    <EnhancedLandingTemplate
      title="Web Development"
      subtitle="Build Powerful Web Apps That Convert"
      intro="Transform your business with modern, lightning-fast websites and web applications that drive real results. Serving Edinburgh, Glasgow, and businesses across Scotland's Central Belt, we create digital experiences that captivate users and boost your bottom line."
      icon={<Globe className="h-4 w-4" />}
      
      heroStats={[
        { label: "Websites Built", value: "150+" },
        { label: "Average Load Time", value: "< 2s" },
        { label: "SEO Score", value: "95+" },
        { label: "Client Satisfaction", value: "98%" }
      ]}
      
      features={[
        "Lightning-fast performance optimisation",
        "Mobile-first responsive design",
        "Advanced SEO & analytics integration",
        "Secure authentication systems",
        "Third-party API integrations",
        "Content Management Systems",
        "E-commerce functionality",
        "Real-time data dashboards"
      ]}
      
      benefits={[
        "Boost conversion rates by up to 40%",
        "Reach customers on any device",
        "Rank higher in search results",
        "Protect user data & build trust",
        "Connect with your favourite tools",
        "Update content without coding",
        "Increase sales & revenue",
        "Make data-driven decisions"
      ]}
      
      techStack={[
        "React", "Next.js", "TypeScript", "Node.js", "Supabase", 
        "Tailwind CSS", "Stripe", "Vercel", "AWS", "PostgreSQL"
      ]}
      
      useCases={[
        { 
          title: "SaaS Dashboard", 
          text: "Real-time analytics, user management, and subscription billing with beautiful, responsive design.", 
          image: "/lovable-uploads/c4140cc5-49a7-448f-a499-fa51ef6ff6c9.png",
          metrics: "40% faster load times"
        },
        { 
          title: "E-commerce Platform", 
          text: "High-converting online stores with advanced product catalogs, payment processing, and inventory management.", 
          image: "/lovable-uploads/ae042420-8758-4f7f-89c6-368216ad3dd5.png",
          metrics: "25% conversion increase"
        },
        { 
          title: "Client Portal", 
          text: "Secure customer portals with project tracking, billing, messaging, and document management.", 
          image: "/lovable-uploads/e8dbb82e-a966-421f-82ba-b83542109f76.png",
          metrics: "60% reduction in support tickets"
        },
      ]}
      
      testimonials={[
        {
          name: "Sarah Chen",
          company: "TechFlow Solutions",
          content: "404 Code Lab delivered a stunning website that increased our leads by 300%. The attention to detail and performance optimisation is incredible.",
          rating: 5
        },
        {
          name: "Michael Rodriguez",
          company: "GreenThumb Landscaping",
          content: "Our new e-commerce site has transformed our business. Sales are up 150% and the mobile experience is flawless.",
          rating: 5
        },
        {
          name: "Emily Watson",
          company: "DataInsight Analytics",
          content: "The custom dashboard they built saves us 10 hours per week. The real-time analytics help us make better decisions faster.",
          rating: 5
        }
      ]}
      
      pricing={[
        {
          name: "Landing Page",
          price: "$2,999",
          period: "project",
          description: "Perfect for showcasing your business and capturing leads",
          features: [
            "Custom responsive design",
            "SEO optimisation",
            "Contact forms",
            "Google Analytics",
            "Mobile optimisation",
            "2 weeks delivery"
          ]
        },
        {
          name: "Business Website",
          price: "$5,999",
          period: "project",
          description: "Complete business presence with CMS and advanced features",
          features: [
            "Everything in Landing Page",
            "Content Management System",
            "Blog functionality",
            "Advanced SEO",
            "Performance optimisation",
            "3 weeks delivery"
          ],
          popular: true
        },
        {
          name: "Custom Web App",
          price: "$12,999+",
          period: "project",
          description: "Full-featured web applications tailored to your needs",
          features: [
            "Custom functionality",
            "User authentication",
            "Database integration",
            "API development",
            "Admin dashboard",
            "Ongoing support"
          ]
        }
      ]}
      
      process={[
        {
          title: "Discovery",
          description: "We analyse your needs, goals, and target audience to create the perfect strategy.",
          icon: <Search className="h-8 w-8 text-primary" />
        },
        {
          title: "Design",
          description: "Beautiful, user-focused designs that reflect your brand and drive conversions.",
          icon: <Palette className="h-8 w-8 text-primary" />
        },
        {
          title: "Development",
          description: "Clean, efficient code built with modern technologies and best practices.",
          icon: <Code className="h-8 w-8 text-primary" />
        },
        {
          title: "Launch",
          description: "Thorough testing, optimisation, and deployment to ensure everything works perfectly.",
          icon: <Zap className="h-8 w-8 text-primary" />
        }
      ]}
      
      faq={[
        {
          question: "How long does it take to build a website?",
          answer: "Timeline depends on complexity. Landing pages take 2 weeks, business websites take 3-4 weeks, and custom web apps take 6-12 weeks. We'll give you an exact timeline during our discovery call."
        },
        {
          question: "Do you provide ongoing maintenance and support?",
          answer: "Yes! We offer maintenance packages starting at $299/month that include security updates, performance monitoring, content updates, and technical support."
        },
        {
          question: "Will my website be mobile-friendly?",
          answer: "Absolutely. All our websites are built mobile-first and fully responsive. With over 60% of web traffic coming from mobile devices, this is essential for success."
        },
        {
          question: "Can you help with SEO and digital marketing?",
          answer: "Yes! We build SEO best practices into every website and offer ongoing digital marketing services including content strategy, social media, and paid advertising."
        }
      ]}
      
      ctaLabel="Start Your Web Project"
      secondaryCtaLabel="View Web Portfolio"
      secondaryCtaHref="/web-portfolio"
      
      seo={{
        title: "Web Development Edinburgh & Glasgow | Scotland | 404 Code Lab",
        description: "Professional web development services across Scotland's Central Belt. Serving Edinburgh, Glasgow, and beyond with custom websites, web apps, and e-commerce solutions. Get your quote today!",
        jsonLd: schemas
      }}
    />
  );
}
