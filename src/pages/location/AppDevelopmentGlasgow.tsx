import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Smartphone, MapPin, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { generateServiceSchema, generateBreadcrumbSchema } from "@/lib/schema";

export default function AppDevelopmentGlasgow() {
  const glasgowAppService = {
    name: "App Development in Glasgow",
    description: "Expert mobile app development for Glasgow businesses. iOS, Android, and cross-platform apps for Scotland's largest city. Specialist development for events, retail, and hospitality.",
    serviceType: "Mobile Application Development",
    areaServed: ["Glasgow", "West End", "Merchant City", "Finnieston", "Shawlands", "Scotland"],
    offers: [
      { name: "Glasgow MVP App", price: "15999", priceCurrency: "GBP" },
      { name: "Glasgow Growth App", price: "29999", priceCurrency: "GBP" },
      { name: "Glasgow Enterprise App", price: "50999", priceCurrency: "GBP" }
    ]
  };

  const schemas = [
    generateServiceSchema(glasgowAppService),
    generateBreadcrumbSchema([
      { name: "Home", url: "https://404codelab.com" },
      { name: "App Development", url: "https://404codelab.com/services/mobile-apps" },
      { name: "Glasgow", url: "https://404codelab.com/app-development-glasgow" }
    ])
  ];

  return (
    <EnhancedLandingTemplate
      title="App Development in Glasgow"
      subtitle="Expert Mobile App Development Services for Glasgow Businesses"
      intro="Elevate your Glasgow business with cutting-edge mobile apps. From music venue ticketing to retail loyalty programs, we create iOS and Android applications that engage users and drive revenue in Scotland's largest city."
      icon={<Smartphone className="h-4 w-4" />}
      
      heroStats={[
        { label: "Apps Launched", value: "50+" },
        { label: "Glasgow Users", value: "180K+" },
        { label: "App Store Rating", value: "4.9★" },
        { label: "Avg Downloads", value: "22K+" }
      ]}
      
      features={[
        "Native iOS & Android development",
        "Cross-platform React Native apps",
        "Progressive Web Apps (PWA)",
        "Real-time features & push notifications",
        "Offline functionality",
        "Payment integration (Stripe, Apple Pay)",
        "Location-based services for Glasgow",
        "API integration & backend development"
      ]}
      
      benefits={[
        "Reach Glasgow's smartphone users (94%)",
        "Engage 1.8M metro area residents",
        "Build brand loyalty with mobile presence",
        "Increase revenue through app channels",
        "Provide offline services",
        "Send targeted push notifications",
        "Track user behaviour & analytics",
        "Scale with Glasgow's creative economy"
      ]}
      
      techStack={[
        "React Native", "Swift", "Kotlin", "Flutter", "TypeScript", 
        "Node.js", "Supabase", "Firebase", "AWS", "Stripe"
      ]}
      
      useCases={[
        { 
          title: "Glasgow Music Venues App", 
          text: "Multi-venue ticketing and discovery app covering Glasgow's live music scene with calendar integration and in-app purchases.", 
          metrics: "£1.8M annual ticket sales"
        },
        { 
          title: "West End Retail Loyalty App", 
          text: "Cross-merchant loyalty program for 50+ Glasgow retailers with digital stamps, rewards redemption, and push offers.", 
          metrics: "35K active users, 180% engagement increase"
        },
        { 
          title: "Glasgow Delivery Platform", 
          text: "Food and retail delivery app covering Greater Glasgow with real-time tracking, driver management, and multi-restaurant ordering.", 
          metrics: "8,000 orders per week"
        },
      ]}
      
      testimonials={[
        {
          name: "James Wilson",
          company: "Glasgow Venues Alliance",
          content: "The ticketing app 404 Code Lab built revolutionised our 12-venue operation. Real-time capacity tracking, digital tickets, and seamless payment processing. Sales increased 250% in the first year.",
          rating: 5
        },
        {
          name: "Emma Ferguson",
          company: "West End Retailers Association",
          content: "Our loyalty app connects 50 independent Glasgow businesses. The engagement rates are incredible and our members report 40% increase in repeat customers. Brilliant work.",
          rating: 5
        },
        {
          name: "Mohammed Khan",
          company: "Glasgow Food Delivery",
          content: "They built our entire delivery platform from scratch - customer app, driver app, and restaurant dashboard. Handles our peak Friday night volume without any issues.",
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
                  <h2 className="text-3xl font-bold">Glasgow's Mobile App Specialists</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  We understand Glasgow's vibrant business landscape from creative industries to hospitality. Our apps are built for Glasgow's diverse market and can handle everything from concert rush to daily retail operations.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <Smartphone className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">94%</div>
                      <div className="text-sm text-muted-foreground">Smartphone Users</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <Users className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">1.8M</div>
                      <div className="text-sm text-muted-foreground">Metro Population</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <TrendingUp className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">1,200+</div>
                      <div className="text-sm text-muted-foreground">Tech Companies</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <TrendingUp className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">£8bn</div>
                      <div className="text-sm text-muted-foreground">Digital Sector Value</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Also serving:</p>
                  <p className="text-muted-foreground">
                    <Link to="/app-development-edinburgh" className="text-primary hover:underline">Edinburgh</Link> • 
                    <Link to="/web-development-glasgow" className="text-primary hover:underline">Web Development Glasgow</Link>
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
                  title="Glasgow App Development Service Area"
                />
              </div>
            </div>
          </div>
        </section>
      }
      
      pricing={[
        {
          name: "Starter App",
          price: "£9,999",
          period: "project",
          description: "Perfect for Glasgow startups and product testing",
          features: [
            "iOS or Android (single platform)",
            "Core features only",
            "Basic backend integration",
            "App Store deployment",
            "3 months support",
            "8-10 weeks delivery"
          ]
        },
        {
          name: "Business App",
          price: "£19,999",
          period: "project",
          description: "Full-featured apps for established Glasgow businesses",
          features: [
            "iOS & Android native apps",
            "Custom UI/UX design",
            "Backend & API development",
            "Push notifications",
            "Analytics integration",
            "12-16 weeks delivery"
          ],
          popular: true
        },
        {
          name: "Enterprise App",
          price: "£39,999+",
          period: "project",
          description: "Complex applications for Glasgow enterprises",
          features: [
            "Everything in Business",
            "Advanced features & integrations",
            "Real-time capabilities",
            "Payment processing",
            "Admin dashboard",
            "Ongoing maintenance"
          ]
        }
      ]}
      
      faq={[
        {
          question: "Do you develop for both iOS and Android?",
          answer: "Yes! We offer native iOS (Swift) and Android (Kotlin) development, as well as cross-platform solutions using React Native. We'll recommend the best approach based on your Glasgow target market and budget."
        },
        {
          question: "Can you handle high-traffic Glasgow events?",
          answer: "Absolutely. We design Glasgow apps with auto-scaling infrastructure that handles massive traffic spikes during concerts, sports events, and festivals without performance degradation."
        },
        {
          question: "Do you understand Glasgow's market?",
          answer: "Yes. We've built apps for Glasgow businesses across creative industries, hospitality, retail, events, and services. We understand what makes Glasgow users engage and convert."
        },
        {
          question: "Do you help with App Store submission?",
          answer: "Yes! We handle the entire App Store and Google Play submission process including compliance, app store optimisation, screenshots, and responding to review feedback."
        }
      ]}
      
      ctaLabel="Start Your Glasgow App"
      secondaryCtaLabel="View App Portfolio"
      secondaryCtaHref="/portfolio/apps"
      
      seo={{
        title: "App Development Glasgow | Mobile App Developer Glasgow Scotland - 404 Code Lab",
        description: "Expert mobile app development in Glasgow. iOS, Android & cross-platform apps for Glasgow businesses. Specialist development for events, retail, hospitality. Call +44 7864 502527",
        jsonLd: schemas
      }}
    />
  );
}
