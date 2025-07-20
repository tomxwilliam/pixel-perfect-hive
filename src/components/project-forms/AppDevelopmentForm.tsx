
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AppDevelopmentFormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const AppDevelopmentForm: React.FC<AppDevelopmentFormProps> = ({ formData, updateFormData }) => {
  const platforms = [
    { id: 'ios', label: 'iOS (iPhone/iPad)' },
    { id: 'android', label: 'Android' },
    { id: 'cross-platform', label: 'Cross-platform (iOS + Android)' }
  ];

  const appCategories = [
    'Social Networking',
    'Productivity',
    'E-commerce/Shopping',
    'Health & Fitness',
    'Food & Drink',
    'Travel',
    'Finance',
    'Education',
    'Entertainment',
    'Business',
    'Utilities',
    'Other'
  ];

  const backendFeatures = [
    { id: 'user-management', label: 'User Management System' },
    { id: 'database', label: 'Database Requirements' },
    { id: 'admin-dashboard', label: 'Admin Dashboard' },
    { id: 'push-notifications', label: 'Push Notifications' },
    { id: 'real-time', label: 'Real-time Features (Chat, Live Updates)' },
    { id: 'third-party', label: 'Third-party Integrations (Social Login, Maps, etc.)' },
    { id: 'payment-processing', label: 'Payment Processing' },
    { id: 'file-storage', label: 'File Storage & Management' },
    { id: 'analytics', label: 'Analytics & Tracking' },
    { id: 'offline-sync', label: 'Offline Functionality & Sync' }
  ];

  const existingMaterials = [
    { id: 'designs', label: 'App designs/mockups' },
    { id: 'references', label: 'Reference apps' },
    { id: 'prototypes', label: 'Prototypes' },
    { id: 'branding', label: 'Brand guidelines' }
  ];

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    const currentPlatforms = formData.appPlatforms || [];
    const updatedPlatforms = checked 
      ? [...currentPlatforms, platformId]
      : currentPlatforms.filter((p: string) => p !== platformId);
    updateFormData('appPlatforms', updatedPlatforms);
  };

  const handleBackendFeatureChange = (featureId: string, checked: boolean) => {
    const currentFeatures = formData.appBackendFeatures || [];
    const updatedFeatures = checked 
      ? [...currentFeatures, featureId]
      : currentFeatures.filter((f: string) => f !== featureId);
    updateFormData('appBackendFeatures', updatedFeatures);
  };

  const handleMaterialChange = (materialId: string, checked: boolean) => {
    const currentMaterials = formData.appMaterials || [];
    const updatedMaterials = checked 
      ? [...currentMaterials, materialId]
      : currentMaterials.filter((m: string) => m !== materialId);
    updateFormData('appMaterials', updatedMaterials);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📱 App Development Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Target Platform(s) *</Label>
            <div className="space-y-2">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={(formData.appPlatforms || []).includes(platform.id)}
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
            <Label htmlFor="appCategory">App Category</Label>
            <Select 
              value={formData.appCategory || ''} 
              onValueChange={(value) => updateFormData('appCategory', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select app category" />
              </SelectTrigger>
              <SelectContent>
                {appCategories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appFunctionality">Core App Functionality *</Label>
            <Textarea
              id="appFunctionality"
              placeholder="Describe what users should be able to do in the app. For example: sign up/login, browse products, make purchases, chat with others, track fitness activities, book appointments, etc. Be as detailed as possible about the main user journey and key features..."
              value={formData.appFunctionality || ''}
              onChange={(e) => updateFormData('appFunctionality', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Backend Requirements</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {backendFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.id}
                    checked={(formData.appBackendFeatures || []).includes(feature.id)}
                    onCheckedChange={(checked) => handleBackendFeatureChange(feature.id, checked as boolean)}
                  />
                  <Label htmlFor={feature.id} className="text-sm">
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>What do you already have?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {existingMaterials.map((material) => (
                <div key={material.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={material.id}
                    checked={(formData.appMaterials || []).includes(material.id)}
                    onCheckedChange={(checked) => handleMaterialChange(material.id, checked as boolean)}
                  />
                  <Label htmlFor={material.id} className="text-sm">
                    {material.label}
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
