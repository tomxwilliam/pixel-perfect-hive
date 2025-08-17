-- Add unique ticket number generation
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_number SERIAL UNIQUE;

-- Create knowledge base tables
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES ticket_categories(id),
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  search_keywords TEXT[]
);

-- Create customer satisfaction survey table
CREATE TABLE IF NOT EXISTS ticket_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create SLA policies table
CREATE TABLE IF NOT EXISTS sla_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  priority TEXT NOT NULL,
  first_response_hours INTEGER NOT NULL,
  resolution_hours INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_type TEXT NOT NULL, -- 'new_ticket', 'status_update', 'resolution', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for knowledge base
CREATE POLICY "Anyone can view published articles" ON knowledge_base_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage articles" ON knowledge_base_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create RLS policies for surveys
CREATE POLICY "Customers can submit surveys for their tickets" ON ticket_surveys
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_id AND tickets.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all surveys" ON ticket_surveys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create RLS policies for SLA policies
CREATE POLICY "Admin only SLA policies" ON sla_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create RLS policies for email templates
CREATE POLICY "Admin only email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Insert default SLA policies
INSERT INTO sla_policies (name, priority, first_response_hours, resolution_hours) VALUES
  ('Low Priority SLA', 'low', 24, 72),
  ('Medium Priority SLA', 'medium', 8, 24),
  ('High Priority SLA', 'high', 2, 8),
  ('Urgent Priority SLA', 'urgent', 1, 4)
ON CONFLICT DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (name, subject, body_html, template_type) VALUES
  (
    'New Ticket Confirmation',
    'Ticket #{ticket_number} has been created',
    '<h2>Hello {customer_name},</h2><p>We have received your support request and created ticket #{ticket_number}.</p><p><strong>Subject:</strong> {ticket_title}</p><p><strong>Priority:</strong> {ticket_priority}</p><p>We will respond within {sla_response_time}.</p><p>Best regards,<br>404 Code Lab Support Team</p>',
    'new_ticket'
  ),
  (
    'Ticket Status Update',
    'Ticket #{ticket_number} status updated',
    '<h2>Hello {customer_name},</h2><p>Your ticket #{ticket_number} status has been updated to: <strong>{new_status}</strong></p><p>{admin_message}</p><p>Best regards,<br>404 Code Lab Support Team</p>',
    'status_update'
  ),
  (
    'Ticket Resolution',
    'Ticket #{ticket_number} has been resolved',
    '<h2>Hello {customer_name},</h2><p>Your ticket #{ticket_number} has been resolved.</p><p><strong>Resolution:</strong> {resolution_message}</p><p>If you have any questions, please reply to this email.</p><p>Best regards,<br>404 Code Lab Support Team</p>',
    'resolution'
  )
ON CONFLICT DO NOTHING;

-- Create function to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := (SELECT COALESCE(MAX(ticket_number), 0) + 1 FROM tickets);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket number generation
DROP TRIGGER IF EXISTS trigger_generate_ticket_number ON tickets;
CREATE TRIGGER trigger_generate_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- Update existing tickets with ticket numbers
UPDATE tickets SET ticket_number = ROW_NUMBER() OVER (ORDER BY created_at) WHERE ticket_number IS NULL;