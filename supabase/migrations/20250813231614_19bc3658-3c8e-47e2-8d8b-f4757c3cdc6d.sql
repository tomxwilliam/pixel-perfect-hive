-- Create ticket categories table
CREATE TABLE public.ticket_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  auto_assign_to UUID REFERENCES auth.users(id),
  sla_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket attachments table
CREATE TABLE public.ticket_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket time logs table
CREATE TABLE public.ticket_time_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  hours_logged DECIMAL(4,2) NOT NULL,
  description TEXT,
  billable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket watchers table (for CC functionality)
CREATE TABLE public.ticket_watchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ticket_id, user_id)
);

-- Create ticket templates table
CREATE TABLE public.ticket_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title_template TEXT NOT NULL,
  description_template TEXT NOT NULL,
  category_id UUID REFERENCES public.ticket_categories(id),
  priority TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket internal notes table
CREATE TABLE public.ticket_internal_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to tickets table
ALTER TABLE public.tickets 
ADD COLUMN category_id UUID REFERENCES public.ticket_categories(id),
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN resolution_time_hours DECIMAL(8,2),
ADD COLUMN satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
ADD COLUMN satisfaction_feedback TEXT,
ADD COLUMN tags TEXT[],
ADD COLUMN is_escalated BOOLEAN DEFAULT false,
ADD COLUMN escalated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN source TEXT DEFAULT 'web';

-- Enable RLS on new tables
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_internal_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ticket_categories
CREATE POLICY "Anyone can view active categories"
ON public.ticket_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.ticket_categories FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Create RLS policies for ticket_attachments
CREATE POLICY "Users can view attachments for their tickets"
ON public.ticket_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_attachments.ticket_id
    AND (tickets.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'::user_role
    ))
  )
);

CREATE POLICY "Users can upload attachments to their tickets"
ON public.ticket_attachments FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_attachments.ticket_id
    AND (tickets.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'::user_role
    ))
  )
);

-- Create RLS policies for ticket_time_logs
CREATE POLICY "Admins can manage time logs"
ON public.ticket_time_logs FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Create RLS policies for ticket_watchers
CREATE POLICY "Users can view watchers for their tickets"
ON public.ticket_watchers FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_watchers.ticket_id
    AND (tickets.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'::user_role
    ))
  )
);

CREATE POLICY "Admins can manage watchers"
ON public.ticket_watchers FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Create RLS policies for ticket_templates
CREATE POLICY "Anyone can view active templates"
ON public.ticket_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage templates"
ON public.ticket_templates FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Create RLS policies for ticket_internal_notes
CREATE POLICY "Admins can manage internal notes"
ON public.ticket_internal_notes FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_ticket_categories_updated_at
  BEFORE UPDATE ON public.ticket_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_templates_updated_at
  BEFORE UPDATE ON public.ticket_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default ticket categories
INSERT INTO public.ticket_categories (name, description, color, sla_hours, sort_order) VALUES
('General Support', 'General questions and support requests', '#6B7280', 24, 1),
('Technical Issue', 'Technical problems and bugs', '#EF4444', 4, 2),
('Billing', 'Billing and payment related inquiries', '#F59E0B', 8, 3),
('Feature Request', 'New feature requests and suggestions', '#10B981', 72, 4),
('Account', 'Account management and access issues', '#8B5CF6', 12, 5);

-- Create function to auto-set due date based on category SLA
CREATE OR REPLACE FUNCTION public.set_ticket_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NEW.due_date IS NULL THEN
    SELECT 
      CASE 
        WHEN tc.sla_hours IS NOT NULL THEN NEW.created_at + (tc.sla_hours || ' hours')::INTERVAL
        ELSE NEW.created_at + '24 hours'::INTERVAL
      END INTO NEW.due_date
    FROM ticket_categories tc
    WHERE tc.id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set due date
CREATE TRIGGER set_ticket_due_date_trigger
  BEFORE INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ticket_due_date();