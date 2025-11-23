import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Globe, MapPin, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { generateServiceSchema, generateBreadcrumbSchema } from "@/lib/schema";

export default function WebDevelopmentEdinburgh() {
  const edinburghWebService = {
    name: "Web Development in Edinburgh",
    description: "Professional web design and development services for Edinburgh businesses. Custom websites, web applications, and e-commerce solutions in Scotland's capital.",
    serviceType: "Web Development",
    areaServed: ["Edinburgh", "Leith", "New Town", "Old Town", "Morningside", "Stockbridge", "Scotland"],
    offers: [
      { name: "Edinburgh Landing Page", price: "2999", priceCurrency: "GBP" },
      { name: "Edinburgh Business Website", price: "5999", priceCurrency: "GBP" },
      { name: "Edinburgh Web App", price: "12999", priceCurrency: "GBP" }
    ]
  };

  const schemas = [
    generateServiceSchema(edinburghWebService),
    generateBreadcrumbSchema([
      { name: "Home", url: "https://404codelab.com" },
      { name: "Web Development", url: "https://404codelab.com/services/web-development" },
      { name: "Edinburgh", url: "https://404codelab.com/web-development-edinburgh" }
    ])
  ];

  return (
    <EnhancedLandingTemplate
      title="Web Development in Edinburgh"
      subtitle="Professional Web Design & Development Services for Edinburgh Businesses"
      intro="Transform your Edinburgh business with cutting-edge web solutions. From historic Old Town startups to New Town enterprises, we create websites and web applications that drive growth in Scotland's capital. Serving Leith, Morningside, Stockbridge, and all Edinburgh areas."
      icon={<Globe className="h-4 w-4" />}
      
      heroStats={[
        { label: "Edinburgh Clients", value: "45+" },
        { label: "Local Projects", value: "80+" },
        { label: "Average ROI", value: "285%" },
        { label: "Response Time", value: "< 2hrs" }
      ]}
      
      features={[
        "Lightning-fast websites for Edinburgh businesses",
        "Mobile-first responsive design",
        "Local Edinburgh SEO optimisation",
        "E-commerce for Edinburgh retailers",
        "Custom web applications",
        "Festival & event websites",
        "Tourism & hospitality platforms",
        "Financial services portals"
      ]}
      
      benefits={[
        "Reach Edinburgh's 540,000+ residents",
        "Tap into Scotland's £14bn digital economy",
        "Boost local search rankings",
        "Stand out in Edinburgh's competitive market",
        "Same-day consultations in Edinburgh",
        "Support Edinburgh's business community",
        "Festival-ready scalable infrastructure",
        "GDPR & UK compliance guaranteed"
      ]}
      
      techStack={[
        "React", "Next.js", "TypeScript", "Node.js", "Supabase", 
        "Tailwind CSS", "Stripe", "Vercel", "AWS", "PostgreSQL"
      ]}
      
      useCases={[
        { 
          title: "Edinburgh Tourism Platform", 
          text: "Multi-language booking system for Edinburgh tours and experiences with real-time availability and payment processing.", 
          metrics: "150% booking increase during Festival season"
        },
        { 
          title: "Financial Services Portal", 
          text: "Secure client portal for Edinburgh-based financial advisors with document management and compliance tracking.", 
          metrics: "£2.5M assets under management increase"
        },
        { 
          title: "Old Town Restaurant Chain", 
          text: "Online ordering and table booking system for 5 Edinburgh restaurants with inventory management.", 
          metrics: "40% increase in online orders"
        },
      ]}
      
      testimonials={[
        {
          name: "James MacLeod",
          company: "Royal Mile Boutique Hotels",
          content: "404 Code Lab delivered a stunning booking system that handles our Festival rush perfectly. Bookings increased 180% in our first year. Their understanding of Edinburgh's tourism market is exceptional.",
          rating: 5
        },
        {
          name: "Fiona Campbell",
          company: "Edinburgh Tech Startups",
          content: "As an Edinburgh startup accelerator, we've recommended 404 Code Lab to dozens of our portfolio companies. Their technical excellence and local market knowledge is unmatched.",
          rating: 5
        },
        {
          name: "David Robertson",
          company: "Leith Consulting Group",
          content: "The client portal they built transformed how we work with our 200+ Edinburgh clients. Professional, responsive, and delivered ahead of schedule.",
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
                  <h2 className="text-3xl font-bold">Serving All Edinburgh Areas</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  From the Castle to the Shore, we serve businesses across Edinburgh and surrounding areas including Leith, Portobello, Morningside, Stockbridge, Corstorphine, and beyond.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <TrendingUp className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">540K+</div>
                      <div className="text-sm text-muted-foreground">Edinburgh Population</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <Users className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">4.5M</div>
                      <div className="text-sm text-muted-foreground">Annual Tourists</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <Globe className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">32K+</div>
                      <div className="text-sm text-muted-foreground">Local Businesses</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <TrendingUp className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">£14bn</div>
                      <div className="text-sm text-muted-foreground">Digital Economy</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Also serving nearby:</p>
                  <p className="text-muted-foreground">
                    <Link to="/web-development-glasgow" className="text-primary hover:underline">Glasgow</Link> • 
                    Livingston • Dunfermline • Falkirk • Stirling
                  </p>
                </div>
              </div>
              <div className="h-[400px] rounded-lg overflow-hidden border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d71575.12872085962!2d-3.2675530644531245!3d55.95206509999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887b800a5982623%3A0x64f2147b7ce71727!2sEdinburgh!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Edinburgh Service Area Map"
                />
              </div>
            </div>
          </div>
        </section>
      }
      
      pricing={[
        {
          name: "Edinburgh Startup",
          price: "£2,499",
          period: "project",
          description: "Perfect for Edinburgh startups and small businesses",
          features: [
            "Custom responsive design",
            "Edinburgh local SEO",
            "Contact forms",
            "Google Analytics",
            "Mobile optimisation",
            "2 weeks delivery"
          ]
        },
        {
          name: "Edinburgh Business",
          price: "£4,999",
          period: "project",
          description: "Complete solution for established Edinburgh businesses",
          features: [
            "Everything in Startup",
            "Content Management System",
            "Blog functionality",
            "Advanced local SEO",
            "Performance optimisation",
            "3 weeks delivery"
          ],
          popular: true
        },
        {
          name: "Edinburgh Enterprise",
          price: "£9,999+",
          period: "project",
          description: "Custom web applications for Edinburgh enterprises",
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
          question: "Do you meet clients in Edinburgh?",
          answer: "Yes! We offer in-person meetings throughout Edinburgh, from coffee shops in the Old Town to your office in the New Town. Same-day consultations available for urgent projects."
        },
        {
          question: "How do you handle Edinburgh's Festival season traffic?",
          answer: "We build all Edinburgh websites with scalable infrastructure that can handle massive traffic spikes during the Festival and Fringe. Your site stays fast even when Edinburgh's population doubles."
        },
        {
          question: "Do you understand Edinburgh's market?",
          answer: "Absolutely. We've worked with Edinburgh businesses across tourism, hospitality, finance, tech, retail, and professional services. We understand the unique challenges and opportunities of the Edinburgh market."
        },
        {
          question: "What areas of Edinburgh do you serve?",
          answer: "We serve all Edinburgh areas including the City Centre, Leith, Portobello, Morningside, Stockbridge, Corstorphine, Newington, Bruntsfield, and surrounding areas like Musselburgh and Dalkeith."
        }
      ]}
      
      ctaLabel="Get Your Edinburgh Quote"
      secondaryCtaLabel="View Our Portfolio"
      secondaryCtaHref="/portfolio/web"
      
      seo={{
        title: "Web Development Edinburgh | Website Design Edinburgh Scotland - 404 Code Lab",
        description: "Professional web development in Edinburgh. Custom websites, e-commerce, and web applications for Edinburgh businesses. Expert local SEO. Serving Leith, Morningside, Stockbridge. Call +44 7864 502527",
        jsonLd: schemas
      }}
    />
  );
}
