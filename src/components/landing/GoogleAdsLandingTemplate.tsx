import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, CheckCircle2, Star, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Seo from '@/components/Seo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { supabase } from '@/integrations/supabase/client';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TrustSignal {
  value: string;
  label: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

interface GoogleAdsLandingProps {
  // SEO
  title: string;
  description: string;
  
  // Hero Section
  headline: string;
  subheadline: string;
  heroImage?: string;
  
  // Trust Signals
  trustSignals: TrustSignal[];
  
  // Benefits
  benefits: Benefit[];
  
  // Social Proof
  testimonials: Testimonial[];
  
  // CTA
  ctaText: string;
  ctaSubtext?: string;
  
  // Form
  formTitle: string;
  additionalFormFields?: React.ReactNode;
  onGetAdditionalFormData?: () => Record<string, any>;
  
  // Urgency
  urgencyMessage?: string;
}

export default function GoogleAdsLandingTemplate({
  title,
  description,
  headline,
  subheadline,
  heroImage,
  trustSignals,
  benefits,
  testimonials,
  ctaText,
  ctaSubtext,
  formTitle,
  additionalFormFields,
  onGetAdditionalFormData,
  urgencyMessage,
}: GoogleAdsLandingProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Capture UTM parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
    };

    try {
      // Determine the source based on current path
      const path = window.location.pathname;
      let source = 'google_ads';
      if (path.includes('web-development')) source = 'google_ads_web';
      else if (path.includes('app-development')) source = 'google_ads_app';
      else if (path.includes('game-development')) source = 'google_ads_game';

      // Get additional form data from parent if available
      const additionalData = onGetAdditionalFormData ? onGetAdditionalFormData() : {};

      // Submit form to edge function
      const { data, error } = await supabase.functions.invoke('send-contact-notification', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          source,
          ...utmData,
          ...additionalData,
        }
      });

      if (error) throw error;

      // Track conversion event
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
          value: 1.0,
          currency: 'USD',
        });
      }
      
      toast({
        title: "Thank you!",
        description: "We'll contact you within 24 hours to discuss your project.",
      });

      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo title={title} description={description} />
      
      {/* Simplified Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-14 md:h-16 items-center justify-between">
          <div className="w-24 h-24 flex items-center justify-center">
            <img src="/lovable-uploads/daa01be4-d91d-4d88-bec9-e9a2e01383a5.png" alt="404 Code Lab" className="w-full h-full object-contain dark:hidden" />
            <img src="/lovable-uploads/40db8b65-10fc-4b8a-bdbe-0c197159ca3a.png" alt="404 Code Lab" className="w-full h-full object-contain hidden dark:block" />
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+447496295759" className="flex items-center gap-2 text-primary font-semibold hover:underline">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">07496 295759</span>
            </a>
            <ThemeToggle />
            <Button size="lg" onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section with Form */}
        <section className="py-12 md:py-20 bg-[url('/assets/hero-bg-light.png')] bg-cover bg-center bg-no-repeat dark:bg-[url('/assets/hero-bg-dark.png')]">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="space-y-6">
                {urgencyMessage && (
                  <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {urgencyMessage}
                  </div>
                )}
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {headline}
                </h1>
                
                <p className="text-xl text-muted-foreground">
                  {subheadline}
                </p>

                {/* Trust Signals */}
                <div className="flex flex-wrap gap-6 pt-4">
                  {trustSignals.map((signal, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-primary">{signal.value}</div>
                      <div className="text-sm text-muted-foreground">{signal.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mobile Form CTA */}
                <Button 
                  size="lg" 
                  className="lg:hidden w-full"
                  onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Lead Form */}
              <div id="lead-form" className="bg-card border rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">{formTitle}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  
                  {additionalFormFields}
                  
                  <div>
                    <Textarea
                      placeholder="Tell us about your project..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : ctaText}
                  </Button>
                  
                  {ctaSubtext && (
                    <p className="text-xs text-center text-muted-foreground">{ctaSubtext}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose 404 Code Lab?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-accent/5">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              What Our Clients Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card border rounded-lg p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-[url('/assets/cta-bg.png')] bg-cover bg-center bg-no-repeat text-primary-foreground">
          <div className="container text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join hundreds of satisfied clients who trust 404 Code Lab with their digital projects.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8"
            >
              {ctaText} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="py-8 border-t">
          <div className="container text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} 404 Code Lab. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="/legal/privacy-policy" className="hover:text-foreground">Privacy Policy</a>
              <a href="/legal/terms-of-service" className="hover:text-foreground">Terms of Service</a>
              <a href="/contact" className="hover:text-foreground">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
