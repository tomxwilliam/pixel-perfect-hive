-- Add template_type to invoice_templates to support quotes
ALTER TABLE public.invoice_templates
ADD COLUMN IF NOT EXISTS template_type text NOT NULL DEFAULT 'invoice';

CREATE INDEX IF NOT EXISTS idx_invoice_templates_template_type
ON public.invoice_templates (template_type);

-- Ensure existing default templates are marked as 'invoice'
UPDATE public.invoice_templates SET template_type = 'invoice' WHERE template_type IS NULL;