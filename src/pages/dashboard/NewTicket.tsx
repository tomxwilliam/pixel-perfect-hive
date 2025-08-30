import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NewTicket = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    project_id: 'none'
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('tickets')
        .insert({
          customer_id: user.id,
          title: formData.title,
          description: formData.description,
          priority: formData.priority as any,
          project_id: formData.project_id === 'none' ? null : formData.project_id
        });

      if (error) throw error;

      toast({
        title: "Support ticket created!",
        description: "We'll respond to your ticket within 24 hours."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', description: 'General questions, minor issues' },
    { value: 'medium', label: 'Medium', description: 'Standard support requests' },
    { value: 'high', label: 'High', description: 'Important issues affecting functionality' },
    { value: 'urgent', label: 'Urgent', description: 'Critical issues, system down' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create Support Ticket</h1>
              <p className="text-muted-foreground">Get help with your projects</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Support Request
              </CardTitle>
              <CardDescription>
                Describe the issue you're experiencing and we'll help you resolve it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => updateFormData('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-sm text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide as much detail as possible about the issue you're experiencing..."
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Include steps to reproduce the issue, error messages, and expected behaviour
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_id">Related Project (Optional)</Label>
                  <Select 
                    value={formData.project_id} 
                    onValueChange={(value) => updateFormData('project_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project (if applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific project</SelectItem>
                      {/* Projects will be loaded dynamically in a real implementation */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Response Time Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Expected Response Times</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>🟢 Low Priority:</span>
                      <span>2-3 business days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🟡 Medium Priority:</span>
                      <span>1-2 business days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🟠 High Priority:</span>
                      <span>4-8 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🔴 Urgent:</span>
                      <span>1-2 hours</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating Ticket..." : "Create Support Ticket"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewTicket;