-- Clean up duplicate default templates for invoices
UPDATE invoice_templates 
SET is_default = false 
WHERE template_type = 'invoice' 
AND is_default = true 
AND id NOT IN (
  SELECT id FROM invoice_templates 
  WHERE template_type = 'invoice' AND is_default = true 
  ORDER BY updated_at DESC LIMIT 1
);

-- Clean up duplicate default templates for quotes
UPDATE invoice_templates 
SET is_default = false 
WHERE template_type = 'quote' 
AND is_default = true 
AND id NOT IN (
  SELECT id FROM invoice_templates 
  WHERE template_type = 'quote' AND is_default = true 
  ORDER BY updated_at DESC LIMIT 1
);

-- Add partial unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS invoice_templates_default_per_type 
ON invoice_templates (template_type, is_default) 
WHERE is_default = true;