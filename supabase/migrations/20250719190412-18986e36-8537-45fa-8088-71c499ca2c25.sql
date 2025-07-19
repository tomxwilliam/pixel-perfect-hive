
-- Create quotes table for quote management
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  project_id UUID,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  quote_number TEXT NOT NULL UNIQUE,
  description TEXT,
  valid_until DATE
);

-- Add RLS policies for quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all quotes" 
  ON public.quotes 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Customers can view own quotes" 
  ON public.quotes 
  FOR SELECT 
  USING (customer_id = auth.uid());

-- Add email notification preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN email_notifications BOOLEAN DEFAULT true,
ADD COLUMN notification_preferences JSONB DEFAULT '{"invoices": true, "quotes": true, "projects": true}';

-- Create trigger for updating updated_at on quotes
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
