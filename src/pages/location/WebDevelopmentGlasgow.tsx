import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Globe, MapPin, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { generateServiceSchema, generateBreadcrumbSchema } from "@/lib/schema";

export default function WebDevelopmentGlasgow() {
  const glasgowWebService = {
    name: "Web Development in Glasgow",
    description: "Expert web design and development services for Glasgow businesses. Custom websites, web applications, and e-commerce solutions in Scotland's largest city.",
    serviceType: "Web Development",
    areaServed: ["Glasgow", "West End", "Merchant City", "Finnieston", "Shawlands", "Partick", "Scotland"],
    offers: [
      { name: "Glasgow Landing Page", price: "2999", priceCurrency: "GBP" },
      { name: "Glasgow Business Website", price: "5999", priceCurrency: "GBP" },
      { name: "Glasgow Web App", price: "12999", priceCurrency: "GBP" }
    ]
  };

  const schemas = [
    generateServiceSchema(glasgowWebService),
    generateBreadcrumbSchema([
      { name: "Home", url: "https://404codelab.com" },
      { name: "Web Development", url: "https://404codelab.com/services/web-development" },
      { name: "Glasgow", url: "https://404codelab.com/web-development-glasgow" }
    ])
  ];

  return (
    <EnhancedLandingTemplate
      title="Web Development in Glasgow"
      subtitle="Expert Web Design & Development Services for Glasgow Businesses"
      intro="Elevate your Glasgow business with powerful web solutions. From West End agencies to City Centre enterprises, we create websites and web applications that drive success in Scotland's largest city. Serving Merchant City, Finnieston, Shawlands, and all Glasgow areas."
      icon={<Globe className="h-4 w-4" />}
      
      heroStats={[
        { label: "Glasgow Clients", value: "60+" },
        { label: "Local Projects", value: "95+" },
        { label: "Average ROI", value: "305%" },
        { label: "Response Time", value: "< 2hrs" }
      ]}
      
      features={[
        "High-performance websites for Glasgow businesses",
        "Mobile-first responsive design",
        "Local Glasgow SEO optimisation",
        "E-commerce for Glasgow retailers",
        "Custom web applications",
        "Event & venue booking systems",
        "Creative industry portfolios",
        "Manufacturing & logistics platforms"
      ]}
      
      benefits={[
        "Reach Glasgow's 635,000+ residents",
        "Tap into £18bn Greater Glasgow economy",
        "Dominate local search results",
        "Stand out in Glasgow's vibrant market",
        "Same-day consultations in Glasgow",
        "Support Glasgow's business community",
        "Event-ready scalable infrastructure",
        "GDPR & UK compliance guaranteed"
      ]}
      
      techStack={[
        "React", "Next.js", "TypeScript", "Node.js", "Supabase", 
        "Tailwind CSS", "Stripe", "Vercel", "AWS", "PostgreSQL"
      ]}
      
      useCases={[
        { 
          title: "Glasgow Music Venue Platform", 
          text: "Multi-venue ticketing and booking system for Glasgow's live music scene with real-time capacity and payment processing.", 
          metrics: "200% ticket sales increase"
        },
        { 
          title: "West End Retail Chain", 
          text: "E-commerce platform for 8 Glasgow retail locations with unified inventory and click-and-collect functionality.", 
          metrics: "£450K online revenue in year 1"
        },
        { 
          title: "Glasgow Manufacturing Portal", 
          text: "B2B ordering system for Glasgow engineering firm with custom quoting and logistics tracking.", 
          metrics: "60% reduction in order processing time"
        },
      ]}
      
      testimonials={[
        {
          name: "Sarah McDonald",
          company: "Glasgow Creative Agency",
          content: "404 Code Lab delivered a portfolio website that perfectly showcases our work. Our enquiries have tripled since launch. Their understanding of Glasgow's creative sector is spot-on.",
          rating: 5
        },
        {
          name: "Mark Stewart",
          company: "West End Hospitality Group",
          content: "Managing 12 Glasgow restaurants needed a robust system. They built us an incredible platform that handles bookings, orders, and deliveries seamlessly. Game-changing for our business.",
          rating: 5
        },
        {
          name: "Linda Chen",
          company: "Glasgow Tech Innovations",
          content: "As a Glasgow-based SaaS startup, we needed a development partner who understood both technology and our local market. 404 Code Lab exceeded all expectations.",
          rating: 5
        }
      ]}
      
      customSection={
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl font-bold">Serving All Glasgow Areas</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  From the Clyde to the West End, we serve businesses across Glasgow and surrounding areas including Merchant City, Finnieston, Shawlands, Partick, Govan, and beyond.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <TrendingUp className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">635K+</div>
                      <div className="text-sm text-muted-foreground">Glasgow Population</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <Users className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">1.8M</div>
                      <div className="text-sm text-muted-foreground">Metro Area</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <Globe className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">45K+</div>
                      <div className="text-sm text-muted-foreground">Local Businesses</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <TrendingUp className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">£18bn</div>
                      <div className="text-sm text-muted-foreground">Regional Economy</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Also serving nearby:</p>
                  <p className="text-muted-foreground">
                    <Link to="/web-development-edinburgh" className="text-primary hover:underline">Edinburgh</Link> • 
                    Paisley • East Kilbride • Hamilton • Cumbernauld
                  </p>
                </div>
              </div>
              <div className="h-[400px] rounded-lg overflow-hidden border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d143322.8988694241!2d-4.330862999999999!3d55.864237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x488815562056ceeb%3A0x71e683b805ef511e!2sGlasgow!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Glasgow Service Area Map"
                />
              </div>
            </div>
          </div>
        </section>
      }
      
      pricing={[
        {
          name: "Glasgow Starter",
          price: "£2,499",
          period: "project",
          description: "Perfect for Glasgow startups and small businesses",
          features: [
            "Custom responsive design",
            "Glasgow local SEO",
            "Contact forms",
            "Google Analytics",
            "Mobile optimisation",
            "2 weeks delivery"
          ]
        },
        {
          name: "Glasgow Professional",
          price: "£4,999",
          period: "project",
          description: "Complete solution for established Glasgow businesses",
          features: [
            "Everything in Starter",
            "Content Management System",
            "Blog functionality",
            "Advanced local SEO",
            "Performance optimisation",
            "3 weeks delivery"
          ],
          popular: true
        },
        {
          name: "Glasgow Enterprise",
          price: "£9,999+",
          period: "project",
          description: "Custom web applications for Glasgow enterprises",
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
      
      faq={[
        {
          question: "Do you meet clients in Glasgow?",
          answer: "Yes! We offer in-person meetings throughout Glasgow, from City Centre offices to West End coffee shops. Same-day consultations available for urgent projects."
        },
        {
          question: "How do you handle high-traffic Glasgow events?",
          answer: "We build all Glasgow websites with scalable infrastructure that handles traffic spikes during major events, concerts, and festivals. Your site stays fast when it matters most."
        },
        {
          question: "Do you understand Glasgow's business landscape?",
          answer: "Absolutely. We've worked with Glasgow businesses across creative industries, hospitality, retail, manufacturing, tech, and professional services. We understand what makes Glasgow businesses succeed."
        },
        {
          question: "What areas of Glasgow do you serve?",
          answer: "We serve all Glasgow areas including City Centre, West End, Merchant City, Finnieston, Shawlands, Partick, Govan, Dennistoun, and surrounding areas like Paisley and East Kilbride."
        }
      ]}
      
      ctaLabel="Get Your Glasgow Quote"
      secondaryCtaLabel="View Our Portfolio"
      secondaryCtaHref="/portfolio/web"
      
      seo={{
        title: "Web Development Glasgow | Website Design Glasgow Scotland - 404 Code Lab",
        description: "Expert web development in Glasgow. Custom websites, e-commerce, and web applications for Glasgow businesses. Professional local SEO. Serving West End, Merchant City, Finnieston. Call +44 7864 502527",
        jsonLd: schemas
      }}
    />
  );
}
