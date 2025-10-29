import GoogleAdsLandingTemplate from '@/components/landing/GoogleAdsLandingTemplate';
import { Zap, Shield, Smartphone, HeadphonesIcon, Code2, Rocket, TrendingUp, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useAdsLandingPage } from '@/hooks/useAdsLandingPages';
import { Loader2 } from 'lucide-react';

export default function WebDevelopmentAds() {
  const [projectType, setProjectType] = useState('');
  const [budget, setBudget] = useState('');
  const { data: pageData, isLoading } = useAdsLandingPage('web_development');

  const getAdditionalFormData = () => ({
    projectType,
    budget,
  });

  if (isLoading || !pageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <GoogleAdsLandingTemplate
      title={pageData.meta_title}
      description={pageData.meta_description}
      
      headline={pageData.headline}
      subheadline={pageData.subheadline}
      
      urgencyMessage={pageData.urgency_message}
      
      trustSignals={pageData.trust_signals}
      
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
      
      testimonials={pageData.testimonials}
      
      ctaText={pageData.cta_text}
      ctaSubtext={pageData.cta_subtext}
      
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
              <SelectItem value="299-999">£299 - £999</SelectItem>
              <SelectItem value="1000-2499">£1,000 - £2,499</SelectItem>
              <SelectItem value="2500-4999">£2,500 - £4,999</SelectItem>
              <SelectItem value="5000+">£5,000+</SelectItem>
              <SelectItem value="not-sure">Not Sure</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
