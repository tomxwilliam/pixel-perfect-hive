-- Fix foreign key to allow deleting invoices even when referenced by hosting_subscriptions
-- Strategy: drop and recreate FK on hosting_subscriptions.invoice_id with ON DELETE SET NULL
-- Also ensure column allows NULL (it already is nullable in schema)

DO $$ BEGIN
  -- Drop constraint if exists
  ALTER TABLE public.hosting_subscriptions DROP CONSTRAINT IF EXISTS hosting_subscriptions_invoice_id_fkey;
EXCEPTION WHEN undefined_object THEN
  -- Constraint might not exist
  NULL;
END $$;

-- Recreate foreign key with ON DELETE SET NULL
ALTER TABLE public.hosting_subscriptions
  ADD CONSTRAINT hosting_subscriptions_invoice_id_fkey
  FOREIGN KEY (invoice_id)
  REFERENCES public.invoices(id)
  ON DELETE SET NULL;

-- Optional safety: add index to speed lookups (if not present)
CREATE INDEX IF NOT EXISTS idx_hosting_subscriptions_invoice_id ON public.hosting_subscriptions(invoice_id);
