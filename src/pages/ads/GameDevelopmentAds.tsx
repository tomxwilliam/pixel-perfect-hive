import GoogleAdsLandingTemplate from '@/components/landing/GoogleAdsLandingTemplate';
import { Gamepad2, TrendingUp, Palette, DollarSign, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useAdsLandingPage } from '@/hooks/useAdsLandingPages';

export default function GameDevelopmentAds() {
  const [gameType, setGameType] = useState('');
  const [currentStage, setCurrentStage] = useState('');
  const { data: pageData, isLoading } = useAdsLandingPage('game_development');

  const getAdditionalFormData = () => ({
    gameType,
    currentStage,
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
          title: 'Proven Monetisation',
          description: 'Multiple revenue streams: ads, IAP, subscriptions. We maximise your game\'s earning potential.',
        },
        {
          icon: <TrendingUp className="h-8 w-8" />,
          title: 'Post-Launch Support',
          description: 'Analytics, updates, and optimisation to grow your player base and revenue over time.',
        },
      ]}
      
      testimonials={pageData.testimonials}
      
      ctaText={pageData.cta_text}
      ctaSubtext={pageData.cta_subtext}
      
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
