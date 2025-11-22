import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Smartphone, MapPin, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function AppDevelopmentEdinburgh() {
  return (
    <EnhancedLandingTemplate
      title="App Development in Edinburgh"
      subtitle="Professional Mobile App Development Services for Edinburgh Businesses"
      intro="Transform your Edinburgh business with powerful mobile apps. From Festival-ready tourism apps to secure financial platforms, we create iOS and Android applications that engage users and drive growth in Scotland's capital."
      icon={<Smartphone className="h-4 w-4" />}
      
      heroStats={[
        { label: "Apps Launched", value: "35+" },
        { label: "Edinburgh Users", value: "125K+" },
        { label: "App Store Rating", value: "4.8★" },
        { label: "Avg Downloads", value: "15K+" }
      ]}
      
      features={[
        "Native iOS & Android development",
        "Cross-platform React Native apps",
        "Progressive Web Apps (PWA)",
        "Real-time features & push notifications",
        "Offline functionality",
        "Payment integration (Stripe, Apple Pay)",
        "Location-based services for Edinburgh",
        "API integration & backend development"
      ]}
      
      benefits={[
        "Reach Edinburgh's smartphone users (92%)",
        "Engage Festival visitors & tourists",
        "Build brand loyalty with mobile presence",
        "Increase revenue through app channels",
        "Provide offline services",
        "Send targeted push notifications",
        "Track user behaviour & analytics",
        "Scale with Edinburgh's tech scene"
      ]}
      
      techStack={[
        "React Native", "Swift", "Kotlin", "Flutter", "TypeScript", 
        "Node.js", "Supabase", "Firebase", "AWS", "Stripe"
      ]}
      
      useCases={[
        { 
          title: "Edinburgh Tour Guide App", 
          text: "Multi-language audio tour app covering Edinburgh Castle, Royal Mile, and Holyrood with AR features and offline maps.", 
          metrics: "50K+ downloads in first Festival season"
        },
        { 
          title: "Festival Ticketing App", 
          text: "Event discovery and mobile ticketing platform for Edinburgh Festival Fringe with QR code scanning and digital wallet integration.", 
          metrics: "£2.5M ticket sales processed"
        },
        { 
          title: "Edinburgh Parking App", 
          text: "Real-time parking availability and payment app covering Edinburgh city centre with automated reminders and zone navigation.", 
          metrics: "25K active monthly users"
        },
      ]}
      
      testimonials={[
        {
          name: "Andrew Morrison",
          company: "Edinburgh Attractions Group",
          content: "The tourism app 404 Code Lab built handles thousands of daily visitors during Festival season flawlessly. The offline audio guides work perfectly even in our historic stone buildings with poor signal.",
          rating: 5
        },
        {
          name: "Rachel Thomson",
          company: "Leith Financial Services",
          content: "Security was paramount for our client portal app. 404 Code Lab delivered a robust, beautifully designed solution that our Edinburgh clients love. Downloads exceeded targets by 300%.",
          rating: 5
        },
        {
          name: "Colin MacPherson",
          company: "Edinburgh Hospitality Apps",
          content: "We needed an app for 15 Edinburgh restaurants with table booking, ordering, and loyalty features. They delivered ahead of schedule and the results have been phenomenal.",
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
                  <h2 className="text-3xl font-bold">Edinburgh's Mobile App Experts</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  We understand Edinburgh's unique market from Festival tourism to financial services. Our apps are built to handle Edinburgh's challenges from signal issues in historic buildings to massive seasonal traffic spikes.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <Smartphone className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">92%</div>
                      <div className="text-sm text-muted-foreground">Smartphone Users</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <Users className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">4.5M</div>
                      <div className="text-sm text-muted-foreground">Tourist Market</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <TrendingUp className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">850+</div>
                      <div className="text-sm text-muted-foreground">Tech Companies</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <TrendingUp className="h-5 w-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">£6bn</div>
                      <div className="text-sm text-muted-foreground">Tech Sector Value</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Also serving:</p>
                  <p className="text-muted-foreground">
                    <Link to="/app-development-glasgow" className="text-primary hover:underline">Glasgow</Link> • 
                    <Link to="/web-development-edinburgh" className="text-primary hover:underline">Web Development Edinburgh</Link>
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
                  title="Edinburgh App Development Service Area"
                />
              </div>
            </div>
          </div>
        </section>
      }
      
      pricing={[
        {
          name: "MVP App",
          price: "£9,999",
          period: "project",
          description: "Perfect for Edinburgh startups and product validation",
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
          name: "Professional App",
          price: "£19,999",
          period: "project",
          description: "Full-featured apps for established Edinburgh businesses",
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
          description: "Complex applications for Edinburgh enterprises",
          features: [
            "Everything in Professional",
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
          answer: "Yes! We offer native iOS (Swift) and Android (Kotlin) development, as well as cross-platform solutions using React Native. We'll recommend the best approach based on your Edinburgh target market and budget."
        },
        {
          question: "How do you handle Edinburgh's poor mobile signal in historic areas?",
          answer: "We build offline-first capabilities into Edinburgh apps, especially for tourism and hospitality. Your app works perfectly in Edinburgh Castle, underground venues, and stone buildings with weak signal."
        },
        {
          question: "Can you handle Festival season traffic spikes?",
          answer: "Absolutely. We design Edinburgh apps with auto-scaling infrastructure that handles massive traffic increases during Festival season without performance issues or downtime."
        },
        {
          question: "Do you help with App Store submission and approval?",
          answer: "Yes! We handle the entire App Store and Google Play submission process including compliance, screenshots, descriptions, and responding to review feedback."
        }
      ]}
      
      ctaLabel="Start Your Edinburgh App"
      secondaryCtaLabel="View App Portfolio"
      secondaryCtaHref="/portfolio/apps"
      
      seo={{
        title: "App Development Edinburgh | Mobile App Developer Edinburgh Scotland - 404 Code Lab",
        description: "Professional mobile app development in Edinburgh. iOS, Android & cross-platform apps for Edinburgh businesses. Expert development for tourism, finance, hospitality. Call +44 7864 502527",
      }}
    />
  );
}
