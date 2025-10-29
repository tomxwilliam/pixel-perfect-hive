import GoogleAdsLandingTemplate from '@/components/landing/GoogleAdsLandingTemplate';
import { Smartphone, Lock, Zap, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function AppDevelopmentAds() {
  const [appType, setAppType] = useState('');
  const [platform, setPlatform] = useState('');

  return (
    <GoogleAdsLandingTemplate
      title="Build Your Mobile App - iOS & Android | 404 Code Lab"
      description="From idea to App Store in 6 weeks. Cross-platform, secure, scalable mobile apps starting at $15,999. 80+ apps launched with 2M+ downloads."
      
      headline="Build Your Mobile App - iOS & Android"
      subheadline="From Idea to App Store in 6 Weeks - Starting at $15,999"
      
      urgencyMessage="🎁 Free consultation - Book within 48 hours and get app icon design free"
      
      trustSignals={[
        { value: '80+', label: 'Apps Launched' },
        { value: '4.7★', label: 'Average Rating' },
        { value: '2M+', label: 'Total Downloads' },
      ]}
      
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
      
      testimonials={[
        {
          quote: 'Our fitness app has 50K active users and growing. The team built exactly what we envisioned and more.',
          author: 'Rachel Green',
          role: 'FitLife App Founder',
          rating: 5,
        },
        {
          quote: 'From concept to launch in 7 weeks. The app is stable, fast, and our customers love it.',
          author: 'Tom Anderson',
          role: 'EcoShop CEO',
          rating: 5,
        },
        {
          quote: 'Best development team we\'ve worked with. Clear communication, on-time delivery, and great quality.',
          author: 'Maria Santos',
          role: 'MediConnect Founder',
          rating: 5,
        },
      ]}
      
      ctaText="Get Your App Quote"
      ctaSubtext="No commitment required. Free 30-minute consultation included."
      
      formTitle="Start Building Your App Today"
      
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
