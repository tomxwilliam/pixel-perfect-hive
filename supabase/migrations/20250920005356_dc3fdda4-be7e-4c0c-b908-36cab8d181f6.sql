-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create domain settings table
CREATE TABLE public.domain_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_provisioning BOOLEAN DEFAULT false,
  allow_domains BOOLEAN DEFAULT true,
  allow_hosting BOOLEAN DEFAULT true,
  nameservers TEXT[] DEFAULT ARRAY['ns1.404codelab.com', 'ns2.404codelab.com'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (is_admin_user());

-- RLS Policies for domain_settings  
CREATE POLICY "Admins can manage domain settings" ON public.domain_settings
  FOR ALL USING (is_admin_user());

CREATE POLICY "Anyone can view domain settings" ON public.domain_settings
  FOR SELECT USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_domain_settings_updated_at
  BEFORE UPDATE ON public.domain_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default domain settings
INSERT INTO public.domain_settings (allow_domains, allow_hosting, auto_provisioning, nameservers)
VALUES (true, true, false, ARRAY['ns1.404codelab.com', 'ns2.404codelab.com']);

-- Insert default email templates
INSERT INTO public.email_templates (category, name, subject, body, is_default) VALUES
-- Domain Management Templates
('domain_management', 'domain_registration_success', 'Domain Registration Successful - {{domain}}', 
'<h1>Domain Registration Successful</h1>
<p>Congratulations! Your domain <strong>{{domain}}</strong> has been successfully registered.</p>
<p><strong>Registration Details:</strong></p>
<ul>
<li>Domain: {{domain}}</li>
<li>Registration Date: {{registration_date}}</li>
<li>Expiry Date: {{expiry_date}}</li>
<li>Nameservers: {{nameservers}}</li>
</ul>
<p>Your domain should be active within 24-48 hours.</p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('domain_management', 'domain_transfer_success', 'Domain Transfer Completed - {{domain}}', 
'<h1>Domain Transfer Completed</h1>
<p>Your domain <strong>{{domain}}</strong> has been successfully transferred to our platform.</p>
<p>The transfer process is now complete and your domain is under our management.</p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('domain_management', 'domain_renewal_30days', 'Domain Renewal Reminder - {{domain}} (30 Days)', 
'<h1>Domain Renewal Reminder</h1>
<p>Your domain <strong>{{domain}}</strong> will expire in 30 days on {{expiry_date}}.</p>
<p>To avoid service interruption, please renew your domain before the expiry date.</p>
<p><a href="{{renewal_url}}">Renew Domain Now</a></p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('domain_management', 'domain_renewal_7days', 'URGENT: Domain Renewal Required - {{domain}} (7 Days)', 
'<h1>URGENT: Domain Renewal Required</h1>
<p>Your domain <strong>{{domain}}</strong> will expire in 7 days on {{expiry_date}}.</p>
<p>This is your final reminder. Please renew immediately to avoid losing your domain.</p>
<p><a href="{{renewal_url}}">Renew Domain Now</a></p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('domain_management', 'domain_expired', 'Domain Expired - {{domain}}', 
'<h1>Domain Expired</h1>
<p>Your domain <strong>{{domain}}</strong> has expired as of {{expiry_date}}.</p>
<p>Your domain is now in the redemption period. You can still recover it, but additional fees may apply.</p>
<p><a href="{{recovery_url}}">Recover Domain</a></p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('domain_management', 'domain_redemption', 'Domain in Redemption Period - {{domain}}', 
'<h1>Domain in Redemption Period</h1>
<p>Your domain <strong>{{domain}}</strong> is currently in the redemption period.</p>
<p>You have {{days_remaining}} days to recover your domain before it becomes available for public registration.</p>
<p><a href="{{recovery_url}}">Recover Domain</a></p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

-- Hosting Templates
('hosting', 'hosting_setup_complete', 'Hosting Account Setup Complete - {{domain}}', 
'<h1>Hosting Account Setup Complete</h1>
<p>Your hosting account for <strong>{{domain}}</strong> has been successfully set up.</p>
<p><strong>Account Details:</strong></p>
<ul>
<li>Domain: {{domain}}</li>
<li>Package: {{package_name}}</li>
<li>Control Panel: <a href="{{cpanel_url}}">{{cpanel_url}}</a></li>
<li>Username: {{username}}</li>
<li>Server IP: {{server_ip}}</li>
</ul>
<p>Your login credentials have been sent separately for security.</p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('hosting', 'hosting_renewal_30days', 'Hosting Renewal Reminder - {{domain}} (30 Days)', 
'<h1>Hosting Renewal Reminder</h1>
<p>Your hosting account for <strong>{{domain}}</strong> will expire in 30 days on {{expiry_date}}.</p>
<p>Package: {{package_name}}</p>
<p><a href="{{renewal_url}}">Renew Hosting</a></p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('hosting', 'hosting_suspension', 'Hosting Account Suspended - {{domain}}', 
'<h1>Hosting Account Suspended</h1>
<p>Your hosting account for <strong>{{domain}}</strong> has been suspended due to {{reason}}.</p>
<p>To restore your account, please contact our support team or resolve the outstanding issue.</p>
<p><a href="{{support_url}}">Contact Support</a></p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('hosting', 'hosting_termination', 'Hosting Account Terminated - {{domain}}', 
'<h1>Hosting Account Terminated</h1>
<p>Your hosting account for <strong>{{domain}}</strong> has been terminated.</p>
<p>All data associated with this account has been permanently deleted.</p>
<p>If you believe this is an error, please contact our support team immediately.</p>
<p>Best regards,<br>404 CodeLab Team</p>', true),

-- Billing Templates
('billing', 'invoice_receipt', 'Payment Receipt - Invoice #{{invoice_number}}', 
'<h1>Payment Receipt</h1>
<p>Thank you for your payment. Your invoice #{{invoice_number}} has been paid successfully.</p>
<p><strong>Payment Details:</strong></p>
<ul>
<li>Invoice Number: {{invoice_number}}</li>
<li>Amount Paid: {{amount}}</li>
<li>Payment Date: {{payment_date}}</li>
<li>Payment Method: {{payment_method}}</li>
</ul>
<p>Best regards,<br>404 CodeLab Team</p>', true),

('billing', 'auto_renewal_confirmation', 'Auto-Renewal Confirmation - {{service}}', 
'<h1>Auto-Renewal Confirmation</h1>
<p>Your {{service}} for <strong>{{domain}}</strong> has been automatically renewed.</p>
<p><strong>Renewal Details:</strong></p>
<ul>
<li>Service: {{service}}</li>
<li>Domain: {{domain}}</li>
<li>Renewal Date: {{renewal_date}}</li>
<li>Next Expiry: {{next_expiry}}</li>
<li>Amount: {{amount}}</li>
</ul>
<p>Best regards,<br>404 CodeLab Team</p>', true),

-- Support Templates
('support', 'ticket_created', 'Support Ticket Created - #{{ticket_number}}', 
'<h1>Support Ticket Created</h1>
<p>Your support ticket #{{ticket_number}} has been created successfully.</p>
<p><strong>Ticket Details:</strong></p>
<ul>
<li>Ticket Number: #{{ticket_number}}</li>
<li>Subject: {{subject}}</li>
<li>Priority: {{priority}}</li>
<li>Created: {{created_date}}</li>
</ul>
<p>We will respond to your ticket within {{sla_hours}} hours.</p>
<p>Best regards,<br>404 CodeLab Support Team</p>', true),

('support', 'ticket_response', 'Support Ticket Updated - #{{ticket_number}}', 
'<h1>Support Ticket Updated</h1>
<p>Your support ticket #{{ticket_number}} has been updated with a new response.</p>
<p><strong>Latest Response:</strong></p>
<blockquote>{{response}}</blockquote>
<p><a href="{{ticket_url}}">View Ticket</a></p>
<p>Best regards,<br>404 CodeLab Support Team</p>', true),

('support', 'ticket_resolved', 'Support Ticket Resolved - #{{ticket_number}}', 
'<h1>Support Ticket Resolved</h1>
<p>Your support ticket #{{ticket_number}} has been resolved.</p>
<p>If you need further assistance, please feel free to reopen this ticket or create a new one.</p>
<p><a href="{{feedback_url}}">Provide Feedback</a></p>
<p>Best regards,<br>404 CodeLab Support Team</p>', true);