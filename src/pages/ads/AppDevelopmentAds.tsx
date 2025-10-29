import GoogleAdsLandingTemplate from '@/components/landing/GoogleAdsLandingTemplate';
import { Smartphone, Lock, Zap, BarChart3, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useAdsLandingPage } from '@/hooks/useAdsLandingPages';

export default function AppDevelopmentAds() {
  const [appType, setAppType] = useState('');
  const [platform, setPlatform] = useState('');
  const { data: pageData, isLoading } = useAdsLandingPage('app_development');

  const getAdditionalFormData = () => ({
    appType,
    platform,
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
          icon: <Smartphone className="h-8 w-8" />,
          title: 'Cross-Platform',
          description: 'One codebase for iOS and Android. Launch on both platforms simultaneously and save costs.',
        },
        {
          icon: <Zap className="h-8 w-8" />,
          title: 'Native Performance',
          description: 'Fast, smooth, and responsive. Your app will feel like it was built specifically for each platform.',
        },
        {
          icon: <Lock className="h-8 w-8" />,
          title: 'Secure & Scalable',
          description: 'Enterprise-grade security and infrastructure. Your app grows with your business.',
        },
        {
          icon: <BarChart3 className="h-8 w-8" />,
          title: 'Analytics Built-In',
          description: 'Track user behavior, engagement, and growth. Make data-driven decisions from day one.',
        },
      ]}
      
      testimonials={pageData.testimonials}
      
      ctaText={pageData.cta_text}
      ctaSubtext={pageData.cta_subtext}
      
      formTitle="Start Building Your App Today"
      onGetAdditionalFormData={getAdditionalFormData}
      
      additionalFormFields={
        <>
          <Select value={appType} onValueChange={setAppType}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="App Category *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Business & Productivity</SelectItem>
              <SelectItem value="social">Social Networking</SelectItem>
              <SelectItem value="health">Health & Fitness</SelectItem>
              <SelectItem value="ecommerce">E-commerce & Shopping</SelectItem>
              <SelectItem value="education">Education & Learning</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="finance">Finance & Banking</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Platform Preference *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">iOS & Android (Recommended)</SelectItem>
              <SelectItem value="ios">iOS Only</SelectItem>
              <SelectItem value="android">Android Only</SelectItem>
              <SelectItem value="not-sure">Not Sure</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
