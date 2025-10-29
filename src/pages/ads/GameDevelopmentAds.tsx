import GoogleAdsLandingTemplate from '@/components/landing/GoogleAdsLandingTemplate';
import { Gamepad2, TrendingUp, Palette, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function GameDevelopmentAds() {
  const [gameType, setGameType] = useState('');
  const [currentStage, setCurrentStage] = useState('');

  const getAdditionalFormData = () => ({
    gameType,
    currentStage,
  });

  return (
    <GoogleAdsLandingTemplate
      title="Mobile Game Development That Generates Revenue | 404 Code Lab"
      description="From concept to App Store in 12 weeks. Addictive gameplay, stunning graphics, proven monetization. 35+ games published generating $2M+ in revenue."
      
      headline="Mobile Game Development That Generates Revenue"
      subheadline="From Concept to App Store in 12 Weeks - Proven Monetization Strategies Included"
      
      urgencyMessage="⏰ Limited slots available for Q4 2025 development"
      
      trustSignals={[
        { value: '35+', label: 'Games Published' },
        { value: '5M+', label: 'Total Downloads' },
        { value: '$2M+', label: 'Revenue Generated' },
      ]}
      
      benefits={[
        {
          icon: <Gamepad2 className="h-8 w-8" />,
          title: 'Addictive Gameplay',
          description: 'Engaging mechanics that keep players coming back. We use proven game design principles.',
        },
        {
          icon: <Palette className="h-8 w-8" />,
          title: 'Stunning Graphics',
          description: 'Eye-catching visuals that stand out in the App Store. Professional art and animations.',
        },
        {
          icon: <DollarSign className="h-8 w-8" />,
          title: 'Proven Monetization',
          description: 'Multiple revenue streams: ads, IAP, subscriptions. We maximize your game\'s earning potential.',
        },
        {
          icon: <TrendingUp className="h-8 w-8" />,
          title: 'Post-Launch Support',
          description: 'Analytics, updates, and optimization to grow your player base and revenue over time.',
        },
      ]}
      
      testimonials={[
        {
          quote: 'Our puzzle game hit 100K downloads in 3 months and generates $8K monthly revenue. Worth every penny!',
          author: 'David Park',
          role: 'Game Studio Founder',
          rating: 5,
        },
        {
          quote: 'They turned our rough idea into a polished, addictive game. The monetization strategy works perfectly.',
          author: 'Lisa Wong',
          role: 'Indie Developer',
          rating: 5,
        },
        {
          quote: 'Professional team that understands both game design and business. Our game is now our main income source.',
          author: 'Alex Rodriguez',
          role: 'Solo Developer',
          rating: 5,
        },
      ]}
      
      ctaText="Start Your Game Project"
      ctaSubtext="Free consultation included. Let's discuss your game idea."
      
      formTitle="Launch Your Hit Game"
      onGetAdditionalFormData={getAdditionalFormData}
      
      additionalFormFields={
        <>
          <Select value={gameType} onValueChange={setGameType}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Game Type *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="puzzle">Puzzle Game</SelectItem>
              <SelectItem value="idle">Idle/Clicker Game</SelectItem>
              <SelectItem value="arcade">Arcade Game</SelectItem>
              <SelectItem value="action">Action Game</SelectItem>
              <SelectItem value="casual">Casual Game</SelectItem>
              <SelectItem value="strategy">Strategy Game</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={currentStage} onValueChange={setCurrentStage}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Current Stage *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idea">Just an Idea</SelectItem>
              <SelectItem value="concept">Concept Ready</SelectItem>
              <SelectItem value="prototype">Have Prototype</SelectItem>
              <SelectItem value="development">In Development</SelectItem>
              <SelectItem value="published">Already Published</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
