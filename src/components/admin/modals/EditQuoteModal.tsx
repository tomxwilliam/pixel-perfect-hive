import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  project_id: string | null;
  amount: number;
  status: string;
  due_date: string | null;
  valid_until: string | null;
  description: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string | null;
}

interface Project {
  id: string;
  title: string;
}

interface QuoteWithCustomer extends Quote {
  customer: Profile;
  project: Project | null;
}

interface EditQuoteModalProps {
  quote: QuoteWithCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuoteUpdated: () => void;
}

export const EditQuoteModal: React.FC<EditQuoteModalProps> = ({
  quote,
  open,
  onOpenChange,
  onQuoteUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [formData, setFormData] = useState({
    customer_id: quote.customer_id,
    project_id: quote.project_id || '',
    amount: quote.amount.toString(),
    description: quote.description || '',
    due_date: quote.due_date ? new Date(quote.due_date) : null,
    valid_until: quote.valid_until ? new Date(quote.valid_until) : null,
  });

  useEffect(() => {
    if (open) {
      fetchCustomersAndProjects();
      setFormData({
        customer_id: quote.customer_id,
        project_id: quote.project_id || '',
        amount: quote.amount.toString(),
        description: quote.description || '',
        due_date: quote.due_date ? new Date(quote.due_date) : null,
        valid_until: quote.valid_until ? new Date(quote.valid_until) : null,
      });
    }
  }, [open, quote]);

  const fetchCustomersAndProjects = async () => {
    try {
      const [customersResult, projectsResult] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, email, company_name").eq("role", "customer"),
        supabase.from("projects").select("id, title"),
      ]);

      if (customersResult.error) throw customersResult.error;
      if (projectsResult.error) throw projectsResult.error;

      setCustomers(customersResult.data || []);
      setProjects(projectsResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load customers and projects");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        customer_id: formData.customer_id,
        project_id: formData.project_id === 'no-project' ? null : formData.project_id,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        due_date: formData.due_date?.toISOString().split('T')[0] || null,
        valid_until: formData.valid_until?.toISOString().split('T')[0] || null,
      };

      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quote.id);

      if (error) throw error;

      // Send notification to customer about quote update
      try {
        await supabase.functions.invoke('admin-notifications', {
          body: {
            action: 'send_quote_update_notification',
            data: {
              user_id: formData.customer_id,
              entity_type: 'quote',
              entity_id: quote.id,
              entity_title: `Quote ${quote.quote_number}`,
              message: 'Your quote has been updated. Please review the changes.',
              created_by: null // Will be set by the edge function
            }
          }
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the main operation if notification fails
      }

      toast.success('Quote updated successfully');
      onQuoteUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Quote {quote.quote_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Quote Number</label>
              <Input value={quote.quote_number} disabled className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Amount (£)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Customer</label>
            <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Project (Optional)</label>
            <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-project">No Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Due Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal mt-1",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    {formData.due_date ? (
                      format(formData.due_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date || undefined}
                    onSelect={(date) => setFormData({ ...formData, due_date: date || null })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium">Valid Until (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal mt-1",
                      !formData.valid_until && "text-muted-foreground"
                    )}
                  >
                    {formData.valid_until ? (
                      format(formData.valid_until, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.valid_until || undefined}
                    onSelect={(date) => setFormData({ ...formData, valid_until: date || null })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description (Optional)</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};