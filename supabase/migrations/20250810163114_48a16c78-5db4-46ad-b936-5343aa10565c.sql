-- Tide payments integration: add columns to invoices for payment links and status
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS tide_payment_link_url text,
  ADD COLUMN IF NOT EXISTS tide_payment_request_id text,
  ADD COLUMN IF NOT EXISTS tide_payment_status text DEFAULT 'pending';

-- Optional index for faster lookups by payment request id
CREATE INDEX IF NOT EXISTS idx_invoices_tide_payment_request_id
  ON public.invoices (tide_payment_request_id);
