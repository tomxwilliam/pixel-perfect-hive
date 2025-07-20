
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
import { ArrowLeft, PoundSterling, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WebDevelopmentForm } from '@/components/project-forms/WebDevelopmentForm';
import { AppDevelopmentForm } from '@/components/project-forms/AppDevelopmentForm';
import { GameDevelopmentForm } from '@/components/project-forms/GameDevelopmentForm';
import { FileUpload, FileList } from '@/components/ui/file-upload';
import { UploadedFile } from '@/hooks/useFileUpload';

interface ProjectFormData {
  title: string;
  project_type: string;
  budget: string;
  timeline: string;
  requirements: {};
  additionalFiles: UploadedFile[];
  // Web Development fields
  websiteType?: string;
  expectedPages?: string;
  webFeatures?: string[];
  webAssets?: string[];
  // App Development fields
  appPlatforms?: string[];
  appCategory?: string;
  appFunctionality?: string;
  appBackendFeatures?: string[];
  appMaterials?: string[];
  // Game Development fields
  gameGenre?: string;
  gamePlatforms?: string[];
  gameplayDescription?: string;
  gameFeatures?: string[];
  gameAssets?: string[];
}

const NewProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    project_type: '',
    budget: '',
    timeline: '',
    requirements: {},
    additionalFiles: []
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

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          customer_id: user.id,
          title: formData.title,
          description: getProjectDescription(),
          project_type: formData.project_type as any,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          requirements: compiledRequirements
        })
        .select()
        .single();

      if (error) throw error;

      // Update uploaded files with the project ID
      if (formData.additionalFiles.length > 0) {
        const fileUpdates = formData.additionalFiles.map(file => 
          supabase
            .from('file_uploads')
            .update({ 
              entity_type: 'project',
              entity_id: project.id 
            })
            .eq('id', file.id)
        );
        
        await Promise.all(fileUpdates);
      }

      toast({
        title: "Project submitted successfully!",
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

  const handleFileUploaded = (file: UploadedFile) => {
    setFormData(prev => ({
      ...prev,
      additionalFiles: [...prev.additionalFiles, file]
    }));
  };

  const handleFileRemoved = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      additionalFiles: prev.additionalFiles.filter(f => f.id !== fileId)
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToStep2 = formData.title && formData.project_type;
  const canProceedToStep3 = canProceedToStep2 && (
    (formData.project_type === 'web' && formData.websiteType) ||
    (formData.project_type === 'app' && formData.appPlatforms && formData.appPlatforms.length > 0) ||
    (formData.project_type === 'game' && formData.gameGenre)
  );

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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Basic Information";
      case 2: return "Project Details";
      case 3: return "Additional Requirements";
      case 4: return "Review & Submit";
      default: return "Project Setup";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Tell us about your project basics";
      case 2: return "Provide specific details for your project type";
      case 3: return "Upload any additional files or requirements";
      case 4: return "Review your project details before submission";
      default: return "";
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
              <p className="text-muted-foreground">Step {currentStep} of 4: {getStepTitle()}</p>
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
                    <Badge variant={currentStep >= 2 ? "default" : "secondary"}>2</Badge>
                    <span className={currentStep >= 2 ? "font-medium" : "text-muted-foreground"}>
                      Project Details
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={currentStep >= 3 ? "default" : "secondary"}>3</Badge>
                    <span className={currentStep >= 3 ? "font-medium" : "text-muted-foreground"}>
                      Additional Files
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={currentStep >= 4 ? "default" : "secondary"}>4</Badge>
                    <span className={currentStep >= 4 ? "font-medium" : "text-muted-foreground"}>
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
                    <CardTitle>{getStepTitle()}</CardTitle>
                    <CardDescription>{getStepDescription()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                      <>
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="budget">Budget Range (GBP £)</Label>
                          <div className="relative">
                            <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                            Optional: Help us understand your budget expectations in British Pounds
                          </p>
                        </div>
                      </>
                    )}

                    {/* Step 2: Project Details */}
                    {currentStep === 2 && formData.project_type && renderProjectTypeForm()}

                    {/* Step 3: Additional Requirements */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Additional Requirements & Files</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload any additional documents, mockups, designs, or reference materials that will help us understand your project better.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <Label>Upload Files</Label>
                          <FileUpload
                            onFileUploaded={handleFileUploaded}
                            entityType="project"
                            maxFileSize={50 * 1024 * 1024} // 50MB
                            allowedTypes={[
                              'application/pdf',
                              'application/msword',
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                              'image/jpeg',
                              'image/png',
                              'image/gif',
                              'text/plain'
                            ]}
                            multiple={true}
                          />
                        </div>

                        {formData.additionalFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label>Uploaded Files</Label>
                            <FileList
                              files={formData.additionalFiles}
                              onRemove={handleFileRemoved}
                              showRemove={true}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Review & Submit */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Project Summary</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Project Title</Label>
                            <p className="text-sm text-muted-foreground">{formData.title}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Project Type</Label>
                            <p className="text-sm text-muted-foreground capitalize">{formData.project_type}</p>
                          </div>
                          {formData.budget && (
                            <div>
                              <Label className="text-sm font-medium">Budget</Label>
                              <p className="text-sm text-muted-foreground">£{Number(formData.budget).toLocaleString()}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-sm font-medium">Additional Files</Label>
                            <p className="text-sm text-muted-foreground">{formData.additionalFiles.length} files uploaded</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Project Description</Label>
                          <p className="text-sm text-muted-foreground mt-1">{getProjectDescription()}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <div className="flex space-x-2">
                    {currentStep > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                    >
                      Save as Draft
                    </Button>
                  </div>

                  <div>
                    {currentStep < 4 ? (
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        disabled={
                          (currentStep === 1 && !canProceedToStep2) ||
                          (currentStep === 2 && !canProceedToStep3)
                        }
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={isLoading || !formData.title || !formData.project_type}
                      >
                        {isLoading ? "Submitting..." : "Submit Project"}
                      </Button>
                    )}
                  </div>
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
