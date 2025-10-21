import { ExternalLink, Server, Shield, Zap, Mail, HardDrive, LifeBuoy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Seo from "@/components/Seo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const AFFILIATE_URL = import.meta.env.VITE_20I_AFFILIATE_URL || "#";

const trackPartnerClick = (location: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click_partner_20i_link', { location });
  }
};

const handlePartnerClick = (location: string) => {
  trackPartnerClick(location);
  window.open(AFFILIATE_URL, '_blank', 'noopener,noreferrer');
};

export default function HostingPartner() {
  const features = [
    {
      icon: Zap,
      title: "Fast UK Cloud Hosting",
      description: "Lightning-fast servers located in the UK with enterprise-grade infrastructure."
    },
    {
      icon: Shield,
      title: "Free Migrations & SSL",
      description: "Hassle-free migration from your current host and free SSL certificates included."
    },
    {
      icon: Server,
      title: "Managed WordPress & Email",
      description: "Fully managed WordPress hosting with professional email accounts."
    },
    {
      icon: HardDrive,
      title: "Scalable Resources",
      description: "Easily scale your hosting resources as your website grows."
    },
    {
      icon: CheckCircle2,
      title: "Transparent Pricing",
      description: "No hidden fees or surprise charges. Clear, straightforward pricing."
    },
    {
      icon: LifeBuoy,
      title: "Great Support",
      description: "UK-based support team available to help when you need it."
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Click 'Go to 20i' to open our partner page.",
      description: "You'll be taken to 20i's website through our secure affiliate link."
    },
    {
      step: 2,
      title: "Choose a Hosting plan (Managed Cloud or WordPress).",
      description: "Select the plan that best fits your needs and budget."
    },
    {
      step: 3,
      title: "Register a new domain or use your existing one.",
      description: "Search for your perfect domain name or transfer an existing domain."
    },
    {
      step: 4,
      title: "Complete checkout directly with 20i.",
      description: "Secure payment processing handled entirely by 20i."
    },
    {
      step: 5,
      title: "Share your 20i login or temporary credentials with us (securely).",
      description: "So we can deploy your site and set up everything for you."
    }
  ];

  const capabilities = [
    "Buy new domain names",
    "Managed cloud hosting & WordPress hosting",
    "SSL certificates & email",
    "DNS & nameserver management",
    "Staging & backups"
  ];

  const faqs = [
    {
      question: "Do I get a discount through your link?",
      answer: "No. The commission is paid to us by 20i; there's no extra cost to you. You'll pay the same price as going directly to 20i."
    },
    {
      question: "Who bills me?",
      answer: "20i bills you directly for hosting & domains. We only bill for our services (web development, design, support, etc.)."
    },
    {
      question: "Can you manage my hosting?",
      answer: "We don't resell hosting; we support you using your 20i account. We can help with deployment, DNS setup, email configuration, and technical guidance."
    },
    {
      question: "Can I migrate from another host?",
      answer: "Yes—20i includes free migrations, and we can help coordinate the migration process to ensure everything transfers smoothly."
    }
  ];

  return (
    <>
      <Seo 
        title="Hosting & Domains via 20i (Our Partner)"
        description="Get reliable UK hosting and domain names through our trusted partner 20i. Fast setup, great support, and transparent pricing."
      />
      
      <Navigation />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="container max-w-4xl">
            <div className="text-center space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                Hosting & Domains via 20i<br />
                <span className="text-muted-foreground">(Our Partner)</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                We recommend 20i for reliable UK hosting and domain names. Sign up through our partner link below and get set up in minutes.
              </p>
              
              <div className="flex flex-col items-center gap-4 pt-4">
                <Button 
                  size="lg"
                  className="text-lg px-8 py-6 btn-glow tap-target"
                  onClick={() => handlePartnerClick('hero_cta')}
                  aria-label="Open 20i partner website in new tab"
                >
                  Go to 20i
                  <ExternalLink className="h-5 w-5" />
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  We may earn a commission when you use our link. No extra cost to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why 20i Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-6xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Why 20i?
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="card-premium">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 md:h-12 md:w-12 text-primary mb-3" />
                    <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm md:text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How to Sign Up Section */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              How to Sign Up
            </h2>
            
            <div className="space-y-6">
              {steps.map((step) => (
                <Card key={step.step}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription className="text-base mt-2">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What You Can Do Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  What You Can Do at 20i
                </h2>
                <ul className="space-y-3">
                  {capabilities.map((capability, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>After You Sign Up</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We'll connect your domain, deploy your site, set up email/DNS, security, and backups. If you need help, open a Support Ticket from your dashboard.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16">
          <div className="container max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Compliance & Support Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Ready to Get Started?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="btn-glow tap-target"
                    onClick={() => handlePartnerClick('bottom_cta')}
                    aria-label="Open 20i partner website in new tab"
                  >
                    Go to 20i
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                  
                  <Button size="lg" variant="outline" asChild>
                    <a href="/support">Open a Support Ticket</a>
                  </Button>
                  
                  <Button size="lg" variant="outline" asChild>
                    <a href="/dashboard/book-call">Book a Call</a>
                  </Button>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Affiliate Disclosure:</strong> We may earn a commission when you use our link. No extra cost to you.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    20i handles all billing and support for hosting & domains. We provide web development and design services separately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}
