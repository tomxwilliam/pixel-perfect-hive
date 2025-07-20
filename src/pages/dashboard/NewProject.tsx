
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WebDevelopmentForm } from '@/components/project-forms/WebDevelopmentForm';
import { AppDevelopmentForm } from '@/components/project-forms/AppDevelopmentForm';
import { GameDevelopmentForm } from '@/components/project-forms/GameDevelopmentForm';

const NewProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
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
      // Compile all the form data into requirements
      const compiledRequirements = {
        // Web Development requirements
        ...(formData.project_type === 'web' && {
          websiteType: formData.websiteType,
          expectedPages: formData.expectedPages,
          webFeatures: formData.webFeatures || [],
          webAssets: formData.webAssets || []
        }),
        // App Development requirements
        ...(formData.project_type === 'app' && {
          appPlatforms: formData.appPlatforms || [],
          appCategory: formData.appCategory,
          appFunctionality: formData.appFunctionality,
          appBackendFeatures: formData.appBackendFeatures || [],
          appMaterials: formData.appMaterials || []
        }),
        // Game Development requirements
        ...(formData.project_type === 'game' && {
          gameGenre: formData.gameGenre,
          gamePlatforms: formData.gamePlatforms || [],
          gameplayDescription: formData.gameplayDescription,
          gameFeatures: formData.gameFeatures || [],
          gameAssets: formData.gameAssets || []
        })
      };

      const { error } = await supabase
        .from('projects')
        .insert({
          customer_id: user.id,
          title: formData.title,
          description: getProjectDescription(),
          project_type: formData.project_type as any,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          requirements: compiledRequirements
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

  const getProjectDescription = () => {
    switch (formData.project_type) {
      case 'web':
        return `Web Development Project: ${formData.websiteType || 'Website'} - ${formData.expectedPages || 'Custom pages and features as specified'}`;
      case 'app':
        return `App Development Project: ${formData.appCategory || 'Mobile Application'} - ${formData.appFunctionality || 'Custom functionality as specified'}`;
      case 'game':
        return `Game Development Project: ${formData.gameGenre || 'Game'} - ${formData.gameplayDescription || 'Custom gameplay as specified'}`;
      default:
        return 'Custom project with detailed requirements';
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderProjectTypeForm = () => {
    switch (formData.project_type) {
      case 'web':
        return <WebDevelopmentForm formData={formData} updateFormData={updateFormData} />;
      case 'app':
        return <AppDevelopmentForm formData={formData} updateFormData={updateFormData} />;
      case 'game':
        return <GameDevelopmentForm formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  const getProjectTypeHelperText = () => {
    switch (formData.project_type) {
      case 'web':
        return "📱 Tell us about your website needs - we'll guide you through the important details";
      case 'app':
        return "📱 Share your app vision - we'll help you plan the features and functionality";
      case 'game':
        return "🎮 Describe your game concept - we'll work together to bring it to life";
      default:
        return "Select a project type above to see detailed questions tailored to your needs";
    }
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
                      Basic Info
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={formData.project_type && currentStep >= 2 ? "default" : "secondary"}>2</Badge>
                    <span className={formData.project_type && currentStep >= 2 ? "font-medium" : "text-muted-foreground"}>
                      Project Details
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                    <CardDescription>
                      Start by providing basic details about your project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        placeholder="My awesome project idea"
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
                          <SelectItem value="web">💻 Web Development</SelectItem>
                          <SelectItem value="app">📱 App Development</SelectItem>
                          <SelectItem value="game">🎮 Game Development</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.project_type && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {getProjectTypeHelperText()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range (USD)</Label>
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
                  </CardContent>
                </Card>

                {/* Dynamic Project Type Form */}
                {formData.project_type && renderProjectTypeForm()}

                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Save as Draft
                  </Button>
                  <Button type="submit" disabled={isLoading || !formData.title || !formData.project_type}>
                    {isLoading ? "Submitting..." : "Submit Project"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProject;
