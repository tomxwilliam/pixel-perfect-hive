import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ProjectRequest {
  title: string;
  description: string;
  project_type: 'web' | 'app' | 'game';
  budget: string;
  timeline: string;
  requirements: {
    features: string[];
    platforms: string[];
    integrations: string[];
    design_preferences: string;
    additional_notes: string;
  };
}

export const ProjectRequestForm = ({ onProjectRequested }: { onProjectRequested?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectRequest, setProjectRequest] = useState<ProjectRequest>({
    title: '',
    description: '',
    project_type: 'web',
    budget: '',
    timeline: '',
    requirements: {
      features: [],
      platforms: [],
      integrations: [],
      design_preferences: '',
      additional_notes: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('create_project_request', {
        project_title: projectRequest.title,
        project_description: projectRequest.description,
        project_type_param: projectRequest.project_type,
        estimated_budget: parseFloat(projectRequest.budget) || null,
        estimated_completion_date: projectRequest.timeline ? new Date(projectRequest.timeline).toISOString().split('T')[0] : null,
        requirements_json: projectRequest.requirements
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your project request has been submitted for approval. We'll get back to you shortly!",
      });

      // Reset form
      setProjectRequest({
        title: '',
        description: '',
        project_type: 'web',
        budget: '',
        timeline: '',
        requirements: {
          features: [],
          platforms: [],
          integrations: [],
          design_preferences: '',
          additional_notes: ''
        }
      });
      
      setIsOpen(false);
      onProjectRequested?.();
    } catch (error) {
      console.error('Error submitting project request:', error);
      toast({
        title: "Error",
        description: "Failed to submit project request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setProjectRequest(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        features: checked 
          ? [...prev.requirements.features, feature]
          : prev.requirements.features.filter(f => f !== feature)
      }
    }));
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setProjectRequest(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        platforms: checked 
          ? [...prev.requirements.platforms, platform]
          : prev.requirements.platforms.filter(p => p !== platform)
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={projectRequest.title}
                onChange={(e) => setProjectRequest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="My awesome project"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={projectRequest.description}
                onChange={(e) => setProjectRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you want to build..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="project_type">Project Type</Label>
              <Select value={projectRequest.project_type} onValueChange={(value: 'web' | 'app' | 'game') => 
                setProjectRequest(prev => ({ ...prev, project_type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Website/Web App</SelectItem>
                  <SelectItem value="app">Mobile App</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Estimated Budget (£)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={projectRequest.budget}
                  onChange={(e) => setProjectRequest(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="timeline">Desired Completion Date</Label>
                <Input
                  id="timeline"
                  type="date"
                  value={projectRequest.timeline}
                  onChange={(e) => setProjectRequest(prev => ({ ...prev, timeline: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="font-medium">Project Requirements</h3>
            
            {/* Features */}
            <div>
              <Label>Key Features</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  'User Authentication',
                  'Payment Processing',
                  'Admin Dashboard',
                  'Real-time Features',
                  'File Upload',
                  'Search Functionality',
                  'Social Integration',
                  'Mobile Responsive'
                ].map(feature => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={projectRequest.requirements.features.includes(feature)}
                      onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <Label>Target Platforms</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  'Web Browser',
                  'iOS App',
                  'Android App',
                  'Desktop App',
                  'PWA',
                  'API/Backend'
                ].map(platform => (
                  <label key={platform} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={projectRequest.requirements.platforms.includes(platform)}
                      onChange={(e) => handlePlatformChange(platform, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="design_preferences">Design Preferences</Label>
              <Textarea
                id="design_preferences"
                value={projectRequest.requirements.design_preferences}
                onChange={(e) => setProjectRequest(prev => ({
                  ...prev,
                  requirements: {
                    ...prev.requirements,
                    design_preferences: e.target.value
                  }
                }))}
                placeholder="Modern, minimalist, colorful, specific brand guidelines..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                value={projectRequest.requirements.additional_notes}
                onChange={(e) => setProjectRequest(prev => ({
                  ...prev,
                  requirements: {
                    ...prev.requirements,
                    additional_notes: e.target.value
                  }
                }))}
                placeholder="Any other requirements, integrations, or specific needs..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};