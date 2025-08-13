import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Category = Tables<'ticket_categories'>;

interface CreateTicketTemplateDialogProps {
  onTemplateCreated: () => void;
}

export const CreateTicketTemplateDialog: React.FC<CreateTicketTemplateDialogProps> = ({
  onTemplateCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    title_template: '',
    description_template: '',
    category_id: '',
    priority: 'medium',
    is_active: true
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_templates')
        .insert({
          ...formData,
          category_id: formData.category_id || null,
          created_by: user.id
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Ticket template created successfully' });
      setOpen(false);
      setFormData({
        name: '',
        title_template: '',
        description_template: '',
        category_id: '',
        priority: 'medium',
        is_active: true
      });
      onTemplateCreated();
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create template',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Ticket Template
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Password Reset Request"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Default Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active Template</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_template">Title Template</Label>
            <Input
              id="title_template"
              value={formData.title_template}
              onChange={(e) => setFormData(prev => ({ ...prev, title_template: e.target.value }))}
              placeholder="e.g., Password reset request for {customer_name}"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use {"{customer_name}"}, {"{customer_email}"}, {"{project_name}"} as placeholders
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_template">Description Template</Label>
            <Textarea
              id="description_template"
              value={formData.description_template}
              onChange={(e) => setFormData(prev => ({ ...prev, description_template: e.target.value }))}
              placeholder="e.g., Customer {customer_name} is requesting a password reset for their account..."
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Available placeholders: {"{customer_name}"}, {"{customer_email}"}, {"{project_name}"}, {"{current_date}"}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};