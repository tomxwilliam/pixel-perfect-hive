import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Check, ArrowRight, Users, Zap, Shield, Globe } from "lucide-react";

export interface UseCaseItem {
  title: string;
  text: string;
  image?: string;
  alt?: string;
  metrics?: string;
}

export interface TestimonialItem {
  name: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  icon: ReactNode;
}

interface EnhancedLandingTemplateProps {
  title: string;
  subtitle: string;
  intro: string;
  features: string[];
  benefits?: string[];
  useCases: UseCaseItem[];
  testimonials?: TestimonialItem[];
  pricing?: PricingTier[];
  process?: ProcessStep[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  icon?: ReactNode;
  heroStats?: { label: string; value: string }[];
  techStack?: string[];
  faq?: { question: string; answer: string }[];
  seo?: { title: string; description: string; noIndex?: boolean };
}

export default function EnhancedLandingTemplate({
  title,
  subtitle,
  intro,
  features,
  benefits,
  useCases,
  testimonials,
  pricing,
  process,
  ctaLabel = "Get Started",
  ctaHref = "/contact",
  secondaryCtaLabel = "View Portfolio",
  secondaryCtaHref = "/portfolio",
  icon,
  heroStats,
  techStack,
  faq,
  seo,
}: EnhancedLandingTemplateProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    provider: { "@type": "Organization", name: "404 Code Lab" },
    description: seo?.description || intro,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {seo && <Seo title={seo.title} description={seo.description} jsonLd={jsonLd} noIndex={seo.noIndex} />}
      <Navigation />
      
      {/* Hero Section */}
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
        
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="outline" className="mb-6 bg-primary/10 border-primary/20">
                {icon && <span className="mr-2">{icon}</span>}
                Premium {title}
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {subtitle}
              </h1>
              
              <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {intro}
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to={ctaHref}>
                    {ctaLabel}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to={secondaryCtaHref}>
                    {secondaryCtaLabel}
                  </Link>
                </Button>
              </div>
              
              {heroStats && (
                <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
                  {heroStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 border-t bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Secure & Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">200+ Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">Worldwide Clients</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Benefits */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Our {title}?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We deliver exceptional results with cutting-edge technology and proven expertise.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={feature} className="border-0 shadow-lg bg-card/50 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature}</CardTitle>
                        {benefits?.[index] && (
                          <CardDescription className="mt-2">{benefits[index]}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        {techStack && (
          <section className="py-16 bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Technology Stack</h2>
                <p className="text-muted-foreground">Built with modern, industry-leading technologies</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {techStack.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Portfolio/Use Cases */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Success Stories</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how we've helped businesses achieve their goals
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((useCase) => (
                <Card key={useCase.title} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                  {useCase.image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={useCase.image}
                        alt={useCase.alt || useCase.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    <CardDescription className="text-base">{useCase.text}</CardDescription>
                    {useCase.metrics && (
                      <Badge variant="outline" className="w-fit mt-2 bg-primary/10 border-primary/20">
                        {useCase.metrics}
                      </Badge>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {testimonials && testimonials.length > 0 && (
          <section className="py-16 bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Clients Say</h2>
                <p className="text-xl text-muted-foreground">Real feedback from real projects</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-card/80 backdrop-blur border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <CardDescription className="text-base italic">
                        "{testimonial.content}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        {testimonial.avatar && (
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pricing */}
        {pricing && pricing.length > 0 && (
          <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Transparent Pricing</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Choose the perfect plan for your project needs
                </p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {pricing.map((tier, index) => (
                  <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-xl scale-105' : ''}`}>
                    {tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground">/{tier.period}</span>
                      </div>
                      <CardDescription className="mt-2">{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        asChild 
                        className="w-full" 
                        variant={tier.popular ? "default" : "outline"}
                      >
                        <Link to={ctaHref}>
                          {tier.ctaText || "Get Started"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Process */}
        {process && process.length > 0 && (
          <section className="py-16 bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Process</h2>
                <p className="text-xl text-muted-foreground">How we bring your vision to life</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {process.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq && faq.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">Everything you need to know about our {title.toLowerCase()} services</p>
              </div>
              
              <div className="space-y-6">
                {faq.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.question}</CardTitle>
                      <CardDescription className="text-base">{item.answer}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-16 sm:py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Start Your {title} Project?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied clients who chose 404 Code Lab for their digital transformation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/contact">
                  Schedule a Call
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}