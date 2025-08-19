import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Lead = Tables<'leads'>;

interface LeadConversionProps {
  lead: Lead;
  onConversionComplete?: () => void;
}

export const LeadConversion = ({ lead, onConversionComplete }: LeadConversionProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    project_type: 'web' as 'web' | 'app' | 'game',
    estimated_budget: lead.deal_value?.toString() || ''
  });

  const handleConvertToProject = async () => {
    if (!projectData.title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('convert_lead_to_project', {
        lead_id_param: lead.id,
        project_title: projectData.title,
        project_description: projectData.description || null,
        project_type: projectData.project_type,
        estimated_budget: parseFloat(projectData.estimated_budget) || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead converted to project successfully! The project is now pending approval.",
      });

      setIsOpen(false);
      onConversionComplete?.();
    } catch (error) {
      console.error('Error converting lead to project:', error);
      toast({
        title: "Error",
        description: "Failed to convert lead to project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill project title if not set
  React.useEffect(() => {
    if (!projectData.title && lead.name && lead.company) {
      setProjectData(prev => ({
        ...prev,
        title: `${lead.company} - ${lead.name} Project`
      }));
    }
  }, [lead, projectData.title]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <TrendingUp className="h-4 w-4 mr-1" />
          Convert to Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Lead to Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Lead Summary */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium">Lead Information</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div><span className="font-medium">Name:</span> {lead.name || lead.email}</div>
              {lead.company && <div><span className="font-medium">Company:</span> {lead.company}</div>}
              <div><span className="font-medium">Email:</span> {lead.email}</div>
              {lead.deal_value && <div><span className="font-medium">Deal Value:</span> £{lead.deal_value.toLocaleString()}</div>}
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="project_title">Project Title</Label>
              <Input
                id="project_title"
                value={projectData.title}
                onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
                required
              />
            </div>

            <div>
              <Label htmlFor="project_description">Project Description</Label>
              <Textarea
                id="project_description"
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project scope and objectives"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="project_type">Project Type</Label>
              <Select value={projectData.project_type} onValueChange={(value: 'web' | 'app' | 'game') => 
                setProjectData(prev => ({ ...prev, project_type: value }))
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

            <div>
              <Label htmlFor="estimated_budget">Estimated Budget (£)</Label>
              <Input
                id="estimated_budget"
                type="number"
                value={projectData.estimated_budget}
                onChange={(e) => setProjectData(prev => ({ ...prev, estimated_budget: e.target.value }))}
                placeholder="5000"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvertToProject} disabled={loading}>
              {loading ? 'Converting...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};