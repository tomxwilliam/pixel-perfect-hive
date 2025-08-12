-- Add template_type to invoice_templates to support quotes and other types
ALTER TABLE public.invoice_templates
ADD COLUMN IF NOT EXISTS template_type text NOT NULL DEFAULT 'invoice';

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_invoice_templates_template_type
ON public.invoice_templates(template_type);
