import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WebDevelopmentFormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const WebDevelopmentForm: React.FC<WebDevelopmentFormProps> = ({ formData, updateFormData }) => {
  const websiteTypes = [
    'Business Website',
    'E-commerce Store',
    'Portfolio Site',
    'Booking Platform',
    'Blog/News Site',
    'Landing Page',
    'Directory/Listing Site',
    'Educational Platform',
    'Community/Forum',
    'Other'
  ];

  const features = [
    { id: 'auth', label: 'User Authentication/Login System' },
    { id: 'payment', label: 'Payment Processing Integration' },
    { id: 'cms', label: 'Content Management System (CMS)' },
    { id: 'admin', label: 'Admin Dashboard' },
    { id: 'blog', label: 'Blog Functionality' },
    { id: 'search', label: 'Search Functionality' },
    { id: 'multilang', label: 'Multi-language Support' },
    { id: 'booking', label: 'Appointment/Booking System' },
    { id: 'chat', label: 'Live Chat Support' },
    { id: 'analytics', label: 'Analytics Integration' },
    { id: 'hosting', label: 'Web Hosting Setup & Management' },
    { id: 'domain', label: 'Domain Registration & Setup' },
    { id: 'ssl', label: 'SSL Certificate Setup' },
    { id: 'email', label: 'Email Setup (Professional Email)' }
  ];

  const existingAssets = [
    { id: 'domain', label: 'Domain name ready' },
    { id: 'content', label: 'Content prepared' },
    { id: 'branding', label: 'Branding/logo ready' },
    { id: 'hosting', label: 'Hosting arranged' }
  ];

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    const currentFeatures = formData.webFeatures || [];
    const updatedFeatures = checked 
      ? [...currentFeatures, featureId]
      : currentFeatures.filter((f: string) => f !== featureId);
    updateFormData('webFeatures', updatedFeatures);
  };

  const handleAssetChange = (assetId: string, checked: boolean) => {
    const currentAssets = formData.webAssets || [];
    const updatedAssets = checked 
      ? [...currentAssets, assetId]
      : currentAssets.filter((a: string) => a !== assetId);
    updateFormData('webAssets', updatedAssets);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📱 Web Development Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteType">What kind of website do you need? *</Label>
            <Select 
              value={formData.websiteType || ''} 
              onValueChange={(value) => updateFormData('websiteType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select website type" />
              </SelectTrigger>
              <SelectContent>
                {websiteTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedPages">Expected Pages & Structure</Label>
            <Textarea
              id="expectedPages"
              placeholder="List the pages you expect (e.g., Home, About, Contact, Services, Portfolio, Blog). Describe the main navigation structure and any special page requirements..."
              value={formData.expectedPages || ''}
              onChange={(e) => updateFormData('expectedPages', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Required Features</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.id}
                    checked={(formData.webFeatures || []).includes(feature.id)}
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
            <Label>What do you already have ready?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {existingAssets.map((asset) => (
                <div key={asset.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={asset.id}
                    checked={(formData.webAssets || []).includes(asset.id)}
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
