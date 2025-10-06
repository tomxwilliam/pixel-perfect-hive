-- Create pending domain orders table for customer orders awaiting admin approval
CREATE TABLE IF NOT EXISTS public.pending_domain_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL,
  years INTEGER NOT NULL DEFAULT 1 CHECK (years >= 1 AND years <= 5),
  domain_price NUMERIC(10,2) NOT NULL CHECK (domain_price >= 0),
  hosting_plan_id UUID REFERENCES public.hosting_packages(id) ON DELETE SET NULL,
  hosting_price NUMERIC(10,2) DEFAULT 0 CHECK (hosting_price >= 0),
  total_estimate NUMERIC(10,2) NOT NULL CHECK (total_estimate >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PAID')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_domain_orders_user_id ON public.pending_domain_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_domain_orders_status ON public.pending_domain_orders(status);
CREATE INDEX IF NOT EXISTS idx_pending_domain_orders_created_at ON public.pending_domain_orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.pending_domain_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own orders
CREATE POLICY "Users can view own pending orders"
  ON public.pending_domain_orders
  FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Users can create their own orders
CREATE POLICY "Users can create own pending orders"
  ON public.pending_domain_orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Only admins can update orders
CREATE POLICY "Admins can update pending orders"
  ON public.pending_domain_orders
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Only admins can delete orders
CREATE POLICY "Admins can delete pending orders"
  ON public.pending_domain_orders
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_pending_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_pending_orders_updated_at_trigger
  BEFORE UPDATE ON public.pending_domain_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pending_orders_updated_at();