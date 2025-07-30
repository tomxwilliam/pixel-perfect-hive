import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

const basicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  customer_id: z.string().min(1, 'Customer is required'),
  project_type: z.enum(['web', 'app', 'game']),
});

const detailsSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled']),
  budget: z.string().optional(),
  estimated_completion_date: z.date().optional(),
});

const requirementsSchema = z.object({
  features: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  special_requirements: z.string().optional(),
});

const formSchema = basicSchema.merge(detailsSchema).merge(requirementsSchema);

interface EnhancedCreateProjectDialogProps {
  onProjectCreated: () => void;
}

export const EnhancedCreateProjectDialog = ({ onProjectCreated }: EnhancedCreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [features, setFeatures] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      customer_id: '',
      project_type: 'web',
      status: 'pending',
      budget: '',
      features: [],
      technologies: [],
      timeline: '',
      special_requirements: '',
    },
  });

  const projectType = form.watch('project_type');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer');
        
        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const getFeatureOptions = (type: string) => {
    const options = {
      web: [
        'User Authentication',
        'Database Integration',
        'Payment Processing',
        'Admin Dashboard',
        'API Development',
        'Content Management',
        'Search Functionality',
        'Real-time Features',
        'Email Integration',
        'Analytics Integration'
      ],
      app: [
        'User Registration/Login',
        'Push Notifications',
        'Offline Support',
        'Camera Integration',
        'GPS/Location Services',
        'Social Media Integration',
        'In-App Purchases',
        'Data Synchronization',
        'Biometric Authentication',
        'Chat/Messaging'
      ],
      game: [
        'Multiplayer Support',
        'Leaderboards',
        'In-Game Purchases',
        'Character Customization',
        'Level Editor',
        'Social Features',
        'Analytics/Telemetry',
        'Save Game System',
        'Audio System',
        'Achievement System'
      ]
    };
    return options[type as keyof typeof options] || [];
  };

  const getTechnologyOptions = (type: string) => {
    const options = {
      web: ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'PHP', 'WordPress', 'Shopify', 'Database'],
      app: ['React Native', 'Flutter', 'Swift (iOS)', 'Kotlin (Android)', 'Xamarin', 'Ionic'],
      game: ['Unity', 'Unreal Engine', 'Godot', 'JavaScript/HTML5', 'C#', 'C++', 'Python']
    };
    return options[type as keyof typeof options] || [];
  };

  const handleFeatureToggle = (feature: string) => {
    const updated = features.includes(feature)
      ? features.filter(f => f !== feature)
      : [...features, feature];
    setFeatures(updated);
    form.setValue('features', updated);
  };

  const handleTechnologyToggle = (tech: string) => {
    const updated = technologies.includes(tech)
      ? technologies.filter(t => t !== tech)
      : [...technologies, tech];
    setTechnologies(updated);
    form.setValue('technologies', updated);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const requirements = {
        features: values.features || [],
        technologies: values.technologies || [],
        timeline: values.timeline || '',
        special_requirements: values.special_requirements || '',
      };

      const { error } = await supabase
        .from('projects')
        .insert({
          title: values.title,
          description: values.description || null,
          customer_id: values.customer_id,
          project_type: values.project_type as any,
          status: values.status as any,
          budget: values.budget ? parseFloat(values.budget) : null,
          estimated_completion_date: values.estimated_completion_date?.toISOString().split('T')[0] || null,
          requirements: requirements,
        });

      if (error) throw error;

      toast.success('Project created successfully');
      setOpen(false);
      form.reset();
      setCurrentStep(1);
      setFeatures([]);
      setTechnologies([]);
      onProjectCreated();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the project"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="web">💻 Web Development</SelectItem>
                        <SelectItem value="app">📱 Mobile App</SelectItem>
                        <SelectItem value="game">🎮 Game Development</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (£)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="estimated_completion_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Estimated Completion Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <FormLabel>Required Features</FormLabel>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {getFeatureOptions(projectType).map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <label htmlFor={feature} className="text-sm">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <FormLabel>Technologies</FormLabel>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {getTechnologyOptions(projectType).map((tech) => (
                  <div key={tech} className="flex items-center space-x-2">
                    <Checkbox
                      id={tech}
                      checked={technologies.includes(tech)}
                      onCheckedChange={() => handleTechnologyToggle(tech)}
                    />
                    <label htmlFor={tech} className="text-sm">
                      {tech}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any specific timeline requirements or milestones"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="special_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requirements or notes"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Enhanced Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project - Step {currentStep} of 3</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "Enter basic project information"}
            {currentStep === 2 && "Set project details and timeline"}
            {currentStep === 3 && "Define requirements and specifications"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};