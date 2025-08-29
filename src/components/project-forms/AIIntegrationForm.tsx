import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIIntegrationFormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const AIIntegrationForm: React.FC<AIIntegrationFormProps> = ({ formData, updateFormData }) => {
  const handleAIFeatureToggle = (feature: string, checked: boolean) => {
    const currentFeatures = formData.aiFeatures || [];
    if (checked) {
      updateFormData('aiFeatures', [...currentFeatures, feature]);
    } else {
      updateFormData('aiFeatures', currentFeatures.filter((f: string) => f !== feature));
    }
  };

  const handleIntegrationTypeToggle = (type: string, checked: boolean) => {
    const currentTypes = formData.aiIntegrationTypes || [];
    if (checked) {
      updateFormData('aiIntegrationTypes', [...currentTypes, type]);
    } else {
      updateFormData('aiIntegrationTypes', currentTypes.filter((t: string) => t !== type));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="aiProjectType">AI Integration Type *</Label>
        <Select 
          value={formData.aiProjectType} 
          onValueChange={(value) => updateFormData('aiProjectType', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select AI integration type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chatbot">🤖 AI Chatbot/Assistant</SelectItem>
            <SelectItem value="automation">⚙️ Process Automation</SelectItem>
            <SelectItem value="analytics">📊 Data Analysis & Insights</SelectItem>
            <SelectItem value="recommendations">🎯 Recommendation Engine</SelectItem>
            <SelectItem value="content">✍️ Content Generation</SelectItem>
            <SelectItem value="custom">🔧 Custom AI Solution</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aiDescription">Project Description *</Label>
        <Textarea
          id="aiDescription"
          placeholder="Describe what you want the AI to do and how it should integrate with your existing systems..."
          value={formData.aiDescription || ''}
          onChange={(e) => updateFormData('aiDescription', e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>AI Features & Capabilities</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Natural Language Processing',
            'Machine Learning Models',
            'Real-time Chat Interface',
            'Voice Recognition',
            'Image/Document Analysis',
            'Predictive Analytics',
            'Automated Workflows',
            'API Integrations',
            'Knowledge Base Integration',
            'Multi-language Support'
          ].map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={(formData.aiFeatures || []).includes(feature)}
                onCheckedChange={(checked) => handleAIFeatureToggle(feature, checked as boolean)}
              />
              <Label htmlFor={feature} className="text-sm">{feature}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Integration Requirements</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Existing Website/App',
            'Customer Support System',
            'CRM Integration',
            'E-commerce Platform',
            'Database Systems',
            'Third-party APIs',
            'Mobile Applications',
            'Cloud Services'
          ].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={(formData.aiIntegrationTypes || []).includes(type)}
                onCheckedChange={(checked) => handleIntegrationTypeToggle(type, checked as boolean)}
              />
              <Label htmlFor={type} className="text-sm">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedUsers">Expected Daily Users</Label>
        <Select 
          value={formData.expectedUsers} 
          onValueChange={(value) => updateFormData('expectedUsers', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select expected usage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">1-100 users/day</SelectItem>
            <SelectItem value="medium">100-1,000 users/day</SelectItem>
            <SelectItem value="large">1,000-10,000 users/day</SelectItem>
            <SelectItem value="enterprise">10,000+ users/day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aiComplexity">Project Complexity</Label>
        <Select 
          value={formData.aiComplexity} 
          onValueChange={(value) => updateFormData('aiComplexity', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select complexity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic - Simple chatbot or automation</SelectItem>
            <SelectItem value="intermediate">Intermediate - Custom AI with learning</SelectItem>
            <SelectItem value="advanced">Advanced - Complex ML models</SelectItem>
            <SelectItem value="enterprise">Enterprise - Multi-system integration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aiTimeline">Preferred Timeline</Label>
        <Select 
          value={formData.aiTimeline} 
          onValueChange={(value) => updateFormData('aiTimeline', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rush">2-4 weeks (Rush)</SelectItem>
            <SelectItem value="normal">1-2 months (Standard)</SelectItem>
            <SelectItem value="extended">2-3 months (Extended)</SelectItem>
            <SelectItem value="flexible">3+ months (Flexible)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};