-- Create invoice_templates table for customizable invoice templates
CREATE TABLE public.invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  company_details JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  layout_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

-- Admin can manage all templates
CREATE POLICY "Admins can manage invoice templates" 
ON public.invoice_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Create trigger for updated_at
CREATE TRIGGER update_invoice_templates_updated_at
BEFORE UPDATE ON public.invoice_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default template
INSERT INTO public.invoice_templates (name, is_default, company_details, branding, layout_settings) 
VALUES (
  'Default Template',
  true,
  '{
    "company_name": "404 Code Lab",
    "address": "Professional Development Services",
    "email": "contact@404codelab.com",
    "phone": "",
    "website": "https://404codelab.com"
  }',
  '{
    "logo_url": "",
    "primary_color": "#007bff",
    "secondary_color": "#28a745",
    "accent_color": "#007bff"
  }',
  '{
    "template_style": "modern",
    "show_company_logo": true,
    "show_payment_terms": true,
    "footer_text": "Thank you for your business!",
    "currency_symbol": "£",
    "date_format": "DD/MM/YYYY"
  }'
);