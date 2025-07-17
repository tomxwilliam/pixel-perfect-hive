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
import { ArrowLeft, Upload, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NewProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_type: '',
    budget: '',
    timeline: '',
    requirements: {}
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
        .from('projects')
        .insert({
          customer_id: user.id,
          title: formData.title,
          description: formData.description,
          project_type: formData.project_type as any,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          requirements: formData.requirements
        });

      if (error) throw error;

      toast({
        title: "Project submitted!",
        description: "We'll review your project and get back to you soon."
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold">Start New Project</h1>
              <p className="text-muted-foreground">Tell us about your project idea</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress Steps */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Badge variant={currentStep >= 1 ? "default" : "secondary"}>1</Badge>
                    <span className={currentStep >= 1 ? "font-medium" : "text-muted-foreground"}>
                      Project Details
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={currentStep >= 2 ? "default" : "secondary"}>2</Badge>
                    <span className={currentStep >= 2 ? "font-medium" : "text-muted-foreground"}>
                      Requirements
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={currentStep >= 3 ? "default" : "secondary"}>3</Badge>
                    <span className={currentStep >= 3 ? "font-medium" : "text-muted-foreground"}>
                      Review & Submit
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    Provide details about your project to help us understand your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        placeholder="My awesome app idea"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project_type">Project Type *</Label>
                      <Select 
                        value={formData.project_type} 
                        onValueChange={(value) => updateFormData('project_type', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="game">🎮 Mobile Game</SelectItem>
                          <SelectItem value="app">📱 Mobile App</SelectItem>
                          <SelectItem value="web">💻 Web Application</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Project Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your project idea, target audience, key features..."
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="budget"
                          placeholder="5000"
                          value={formData.budget}
                          onChange={(e) => updateFormData('budget', e.target.value)}
                          className="pl-10"
                          type="number"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Optional: Help us understand your budget expectations
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Requirements</Label>
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-2">
                          We'll discuss detailed requirements in our consultation call
                        </p>
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files (Coming Soon)
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                      >
                        Save as Draft
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit Project"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProject;