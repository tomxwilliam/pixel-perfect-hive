import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Monitor, Star, TrendingUp, Zap, Users, Palette, Code, Rocket } from "lucide-react";
import Seo from "@/components/Seo";

export default function WebDevelopment() {
  const seoData = {
    title: "Professional Web Development Services | Custom Websites | 404 Code Lab",
    description: "Custom web development services for businesses. Modern, responsive websites built with React, Next.js, and cutting-edge technologies. From concept to launch.",
    canonicalUrl: "https://404codelab.com/services/web-development"
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Web Development Services",
    "provider": { "@type": "Organization", "name": "404 Code Lab" },
    "areaServed": "Global",
    "serviceType": "Web Development",
    "description": seoData.description
  };

  return (
    <>
      <Seo {...seoData} jsonLd={jsonLd} />
      <EnhancedLandingTemplate
        title="Web Development"
        subtitle="Beautiful, Fast & Scalable Websites"
        intro="From stunning portfolios to complex web applications, we build modern websites that convert visitors into customers. Beautiful design meets powerful functionality."
        icon={<Monitor className="h-4 w-4" />}
        
        heroStats={[
          { label: "Websites Delivered", value: "200+" },
          { label: "Average Load Time", value: "<2s" },
          { label: "Client Satisfaction", value: "98%" },
          { label: "Years Experience", value: "8+" }
        ]}
        
        features={[
          "Responsive design for all devices",
          "Lightning-fast performance",
          "SEO optimized for search engines",
          "Modern UI/UX design",
          "Content management systems",
          "E-commerce integration",
          "Analytics & tracking",
          "Ongoing maintenance & support"
        ]}
        
        benefits={[
          "Increase online visibility",
          "Improve user experience",
          "Boost conversion rates",
          "Professional brand image",
          "Mobile-first approach",
          "Search engine friendly",
          "Scalable architecture",
          "Future-proof technology"
        ]}
        
        techStack={[
          "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js",
          "Supabase", "Vercel", "Figma", "WordPress", "Shopify"
        ]}
        
        useCases={[
          {
            title: "E-commerce Store",
            text: "Full-featured online store with payment processing, inventory management, and customer accounts.",
            image: "/lovable-uploads/47f9ad80-e301-4e42-aab1-48bedbe2da16.png",
            metrics: "300% increase in online sales"
          },
          {
            title: "Business Website",
            text: "Professional company website with CMS, contact forms, and lead generation features.",
            image: "/lovable-uploads/621f61df-74f7-45ba-b1d7-4c1b7251d429.png",
            metrics: "150% boost in qualified leads"
          },
          {
            title: "Portfolio Site",
            text: "Stunning creative portfolio showcasing work with interactive galleries and project case studies.",
            image: "/lovable-uploads/daa01be4-d91d-4d88-bec9-e9a2e01383a5.png",
            metrics: "5x increase in client inquiries"
          }
        ]}
        
        testimonials={[
          {
            name: "Sarah Johnson",
            company: "Creative Agency",
            content: "Our new website increased conversions by 200%! The design is stunning and the performance is incredible.",
            rating: 5
          },
          {
            name: "Michael Chen",
            company: "Tech Startup",
            content: "The team delivered exactly what we needed - a scalable platform that grows with our business.",
            rating: 5
          },
          {
            name: "Emma Wilson",
            company: "E-commerce Brand",
            content: "Sales increased 400% after launching our new store. The user experience is seamless.",
            rating: 5
          }
        ]}
        
        pricing={[
          {
            name: "Starter Website",
            price: "$4,999",
            period: "project",
            description: "Perfect for small businesses and personal brands",
            features: [
              "Up to 5 pages",
              "Responsive design",
              "Contact form",
              "Basic SEO setup",
              "Social media integration",
              "6 weeks delivery"
            ]
          },
          {
            name: "Business Website",
            price: "$9,999",
            period: "project",
            description: "Advanced features for growing businesses",
            features: [
              "Everything in Starter",
              "Up to 15 pages",
              "Content Management System",
              "Advanced SEO & Analytics",
              "Payment integration",
              "8 weeks delivery"
            ],
            popular: true
          },
          {
            name: "Enterprise Platform",
            price: "$24,999+",
            period: "project",
            description: "Custom web applications and complex systems",
            features: [
              "Custom web application",
              "Database integration",
              "User authentication",
              "API development",
              "Third-party integrations",
              "Ongoing support included"
            ]
          }
        ]}
        
        process={[
          {
            title: "Discovery",
            description: "Understanding your goals, target audience, and technical requirements.",
            icon: <Users className="h-8 w-8 text-primary" />
          },
          {
            title: "Design",
            description: "Creating wireframes, mockups, and interactive prototypes for approval.",
            icon: <Palette className="h-8 w-8 text-primary" />
          },
          {
            title: "Development",
            description: "Building your website with clean, scalable code and rigorous testing.",
            icon: <Code className="h-8 w-8 text-primary" />
          },
          {
            title: "Launch",
            description: "Deploying your site, setting up analytics, and providing training.",
            icon: <Rocket className="h-8 w-8 text-primary" />
          }
        ]}
        
        faq={[
          {
            question: "How much does a custom website cost?",
            answer: "Website costs depend on complexity and features. Simple business sites start at £4,999, while complex web applications start at £24,999. We'll provide a detailed quote based on your requirements."
          },
          {
            question: "How long does it take to build a website?",
            answer: "Timeline varies by project scope. Starter websites take 4-6 weeks, business websites take 6-8 weeks, and complex applications can take 12+ weeks. We'll provide a detailed timeline in your proposal."
          },
          {
            question: "Do you provide ongoing maintenance?",
            answer: "Yes! We offer maintenance packages including updates, security monitoring, performance optimization, and content changes. This ensures your website stays secure and performs optimally."
          },
          {
            question: "Will my website be mobile-friendly?",
            answer: "Absolutely! All our websites are built with a mobile-first approach and are fully responsive, ensuring they look and work perfectly on all devices."
          }
        ]}
        
        ctaLabel="Start Your Web Project"
        secondaryCtaLabel="View Web Portfolio"
        secondaryCtaHref="/portfolio/web"
        
        seo={{
          title: seoData.title,
          description: seoData.description,
        }}
      />
    </>
  );
}