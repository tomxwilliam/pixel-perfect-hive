
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameDevelopmentFormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const GameDevelopmentForm: React.FC<GameDevelopmentFormProps> = ({ formData, updateFormData }) => {
  const gameGenres = [
    'Idle/Clicker',
    'RPG (Role-Playing)',
    'Puzzle',
    'Platformer',
    'Strategy',
    'Action/Adventure',
    'Racing',
    'Simulation',
    'Card Game',
    'Board Game',
    'Educational',
    'Casual',
    'Other'
  ];

  const targetPlatforms = [
    { id: 'mobile', label: 'Mobile (iOS/Android)' },
    { id: 'pc', label: 'PC (Windows/Mac/Linux)' },
    { id: 'web', label: 'Web Browser' },
    { id: 'console', label: 'Console (PlayStation/Xbox/Nintendo)' }
  ];

  const gameFeatures = [
    { id: 'multiplayer', label: 'Multiplayer Functionality' },
    { id: 'in-game-store', label: 'In-game Purchases/Store' },
    { id: 'leaderboards', label: 'Leaderboards' },
    { id: 'social-features', label: 'Social Features (Friends, Sharing)' },
    { id: 'ad-monetization', label: 'Ad Monetization' },
    { id: 'achievement-system', label: 'Achievement System' },
    { id: 'cloud-saves', label: 'Cloud Save System' },
    { id: 'customization', label: 'Character/Item Customization' },
    { id: 'tournament-mode', label: 'Tournament/Competition Mode' },
    { id: 'daily-challenges', label: 'Daily Challenges/Quests' }
  ];

  const gameAssets = [
    { id: 'art', label: 'Game art/graphics' },
    { id: 'sound', label: 'Sound effects/music' },
    { id: 'story', label: 'Story/narrative' },
    { id: 'mechanics', label: 'Game mechanics defined' }
  ];

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    const currentPlatforms = formData.gamePlatforms || [];
    const updatedPlatforms = checked 
      ? [...currentPlatforms, platformId]
      : currentPlatforms.filter((p: string) => p !== platformId);
    updateFormData('gamePlatforms', updatedPlatforms);
  };

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    const currentFeatures = formData.gameFeatures || [];
    const updatedFeatures = checked 
      ? [...currentFeatures, featureId]
      : currentFeatures.filter((f: string) => f !== featureId);
    updateFormData('gameFeatures', updatedFeatures);
  };

  const handleAssetChange = (assetId: string, checked: boolean) => {
    const currentAssets = formData.gameAssets || [];
    const updatedAssets = checked 
      ? [...currentAssets, assetId]
      : currentAssets.filter((a: string) => a !== assetId);
    updateFormData('gameAssets', updatedAssets);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎮 Game Development Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameGenre">Game Genre *</Label>
            <Select 
              value={formData.gameGenre || ''} 
              onValueChange={(value) => updateFormData('gameGenre', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select game genre" />
              </SelectTrigger>
              <SelectContent>
                {gameGenres.map((genre) => (
                  <SelectItem key={genre} value={genre.toLowerCase().replace(/\s+/g, '-')}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Platform(s) *</Label>
            <div className="space-y-2">
              {targetPlatforms.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={(formData.gamePlatforms || []).includes(platform.id)}
                    onCheckedChange={(checked) => handlePlatformChange(platform.id, checked as boolean)}
                  />
                  <Label htmlFor={platform.id} className="text-sm">
                    {platform.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameplayDescription">Gameplay Description *</Label>
            <Textarea
              id="gameplayDescription"
              placeholder="Describe what the gameplay is like. How do players interact with the game? What's the main objective? What makes it fun and engaging? Include details about game mechanics, progression system, difficulty levels, etc..."
              value={formData.gameplayDescription || ''}
              onChange={(e) => updateFormData('gameplayDescription', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Game Features</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gameFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.id}
                    checked={(formData.gameFeatures || []).includes(feature.id)}
                    onCheckedChange={(checked) => handleFeatureChange(feature.id, checked as boolean)}
                  />
                  <Label htmlFor={feature.id} className="text-sm">
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>What game assets do you already have?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gameAssets.map((asset) => (
                <div key={asset.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={asset.id}
                    checked={(formData.gameAssets || []).includes(asset.id)}
                    onCheckedChange={(checked) => handleAssetChange(asset.id, checked as boolean)}
                  />
                  <Label htmlFor={asset.id} className="text-sm">
                    {asset.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
