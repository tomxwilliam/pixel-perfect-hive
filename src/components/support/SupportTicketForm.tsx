import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Category = Tables<'ticket_categories'>;
type Project = { id: string; title: string; };
type KnowledgeArticle = { id: string; title: string; content: string; };

interface UploadedFile {
  id: string;
  filename: string;
  fileSize: number;
}

export const SupportTicketForm = () => {
  const { user } = useAuth();
  const { uploadFile, isUploading } = useFileUpload();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [suggestedArticles, setSuggestedArticles] = useState<KnowledgeArticle[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category_id: '',
    project_id: ''
  });

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchUserProjects();
    }
  }, [user]);

  // Search for relevant knowledge base articles when title changes
  useEffect(() => {
    const searchKeywords = formData.title.toLowerCase().split(' ').filter(word => word.length > 2);
    if (searchKeywords.length > 0) {
      searchKnowledgeBase(searchKeywords);
    } else {
      setSuggestedArticles([]);
    }
  }, [formData.title]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .eq('customer_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const searchKnowledgeBase = async (keywords: string[]) => {
    try {
      let query = supabase
        .from('knowledge_base_articles')
        .select('id, title, content')
        .eq('is_published', true);

      // Search in title and content
      const searchTerm = keywords.join(' | ');
      const { data, error } = await query
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .limit(3);

      if (error) throw error;
      setSuggestedArticles(data || []);
    } catch (error) {
      console.error('Error searching knowledge base:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      try {
        const uploadedFile = await uploadFile(file, 'ticket');
        if (uploadedFile) {
          setUploadedFiles(prev => [...prev, {
            id: uploadedFile.id,
            filename: uploadedFile.filename,
            fileSize: uploadedFile.fileSize
          }]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          customer_id: user.id,
          title: formData.title,
          description: formData.description,
          priority: formData.priority as any,
          category_id: formData.category_id || null,
          project_id: formData.project_id || null,
          source: 'web'
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Update file uploads with ticket ID
      if (uploadedFiles.length > 0) {
        await supabase
          .from('file_uploads')
          .update({ entity_id: ticketData.id })
          .in('id', uploadedFiles.map(f => f.id));
      }

      toast.success('Support ticket created successfully!', {
        description: `Ticket #${ticketData.ticket_number} has been created. We'll respond within 24 hours.`
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category_id: '',
        project_id: ''
      });
      setUploadedFiles([]);
      setSuggestedArticles([]);
      
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', description: 'General questions, minor issues', time: '2-3 business days' },
    { value: 'medium', label: 'Medium', description: 'Standard support requests', time: '1-2 business days' },
    { value: 'high', label: 'High', description: 'Important issues affecting functionality', time: '4-8 hours' },
    { value: 'urgent', label: 'Urgent', description: 'Critical issues, system down', time: '1-2 hours' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Knowledge Base Suggestions */}
      {suggestedArticles.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Before creating a ticket, check these helpful articles:
                </h4>
                <div className="space-y-2">
                  {suggestedArticles.map((article) => (
                    <div key={article.id} className="text-sm">
                      <button className="text-blue-700 dark:text-blue-300 hover:underline text-left">
                        {article.title}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Subject *</Label>
            <Input
              id="title"
              placeholder="Brief description of your issue"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category_id} onValueChange={(value) => updateFormData('category_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level *</Label>
            <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
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
            <Label htmlFor="project">Related Project (Optional)</Label>
            <Select value={formData.project_id} onValueChange={(value) => updateFormData('project_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
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

        {/* File Attachments */}
        <div className="space-y-4">
          <Label>File Attachments (Optional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Choose Files'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Max 10MB per file. Supported: images, documents, archives
              </p>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploaded Files:</p>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response Time Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expected Response Times
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {priorityOptions.map((option) => (
                <div key={option.value} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={option.value === 'urgent' ? 'destructive' : 'outline'}>
                      {option.label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{option.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={loading || isUploading} size="lg">
            {loading ? "Creating Ticket..." : "Create Support Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
};