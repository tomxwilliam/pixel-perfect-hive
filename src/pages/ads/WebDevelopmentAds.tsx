import GoogleAdsLandingTemplate from '@/components/landing/GoogleAdsLandingTemplate';
import { Zap, Shield, Smartphone, HeadphonesIcon, Code2, Rocket, TrendingUp, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function WebDevelopmentAds() {
  const [projectType, setProjectType] = useState('');
  const [budget, setBudget] = useState('');

  const getAdditionalFormData = () => ({
    projectType,
    budget,
  });

  return (
    <GoogleAdsLandingTemplate
      title="Professional Web Development Starting at £2,499 | 404 Code Lab"
      description="Launch your professional website in 2 weeks. SEO-optimised, mobile-responsive, and built to convert. No hidden fees. Get your free quote today."
      
      headline="Professional Web Development Starting at £2,499"
      subheadline="Launch Your Website in 2 Weeks - No Hidden Fees, 100% Satisfaction Guaranteed"
      
      urgencyMessage="🔥 Book this week and save 10% on your project"
      
      trustSignals={[
        { value: '150+', label: 'Websites Built' },
        { value: '98%', label: 'Client Satisfaction' },
        { value: '< 2s', label: 'Load Time' },
      ]}
      
      benefits={[
        {
          icon: <Zap className="h-8 w-8" />,
          title: 'Lightning Fast',
          description: 'Optimised for speed with load times under 2 seconds. Fast sites rank higher and convert better.',
        },
        {
          icon: <Smartphone className="h-8 w-8" />,
          title: 'Mobile Responsive',
          description: 'Perfect on every device. 60% of web traffic is mobile - your site will look amazing everywhere.',
        },
        {
          icon: <TrendingUp className="h-8 w-8" />,
          title: 'SEO Optimised',
          description: 'Built for search engines from day one. Get found by customers searching for your services.',
        },
        {
          icon: <HeadphonesIcon className="h-8 w-8" />,
          title: 'Ongoing Support',
          description: '30 days of free support included. We\'re here to help you succeed after launch.',
        },
      ]}
      
      testimonials={[
        {
          quote: 'Our new website increased leads by 300% in the first month. The team at 404 Code Lab delivered beyond our expectations.',
          author: 'Sarah Johnson',
          role: 'CEO, TechStart Inc',
          rating: 5,
        },
        {
          quote: 'Professional, fast, and affordable. They turned our vision into reality and the site performs flawlessly.',
          author: 'Mike Chen',
          role: 'Founder, GreenEats',
          rating: 5,
        },
        {
          quote: 'Best investment we made for our business. The website pays for itself with the new clients we get every week.',
          author: 'Jennifer Martinez',
          role: 'Owner, Elite Fitness',
          rating: 5,
        },
      ]}
      
      ctaText="Get Your Free Quote Today"
      ctaSubtext="No obligation. Receive your custom quote within 24 hours."
      
      formTitle="Get Your Custom Web Development Quote"
      onGetAdditionalFormData={getAdditionalFormData}
      
      additionalFormFields={
        <>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Project Type *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Business Website</SelectItem>
              <SelectItem value="ecommerce">E-commerce Store</SelectItem>
              <SelectItem value="portfolio">Portfolio Site</SelectItem>
              <SelectItem value="blog">Blog/Content Site</SelectItem>
              <SelectItem value="landing">Landing Page</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Budget Range *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2499-3999">£2,499 - £3,999</SelectItem>
              <SelectItem value="4000-7999">£4,000 - £7,999</SelectItem>
              <SelectItem value="8000-15999">£8,000 - £15,999</SelectItem>
              <SelectItem value="16000+">£16,000+</SelectItem>
              <SelectItem value="not-sure">Not Sure</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
