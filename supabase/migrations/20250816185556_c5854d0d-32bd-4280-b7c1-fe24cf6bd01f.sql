-- Create sales pipeline stages table
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stage_order INTEGER NOT NULL,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead activities table for tracking interactions
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'note', 'stage_change'
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add pipeline stage to leads table
ALTER TABLE public.leads ADD COLUMN pipeline_stage_id UUID REFERENCES public.pipeline_stages(id);
ALTER TABLE public.leads ADD COLUMN probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100);
ALTER TABLE public.leads ADD COLUMN deal_value NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN expected_close_date DATE;
ALTER TABLE public.leads ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pipeline stages
CREATE POLICY "Admin only pipeline stages" ON public.pipeline_stages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create RLS policies for lead activities
CREATE POLICY "Admin only lead activities" ON public.lead_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Insert default pipeline stages
INSERT INTO public.pipeline_stages (name, description, stage_order, color) VALUES
  ('Lead', 'Initial contact or inquiry', 1, '#94a3b8'),
  ('Qualified', 'Lead has been qualified and shows genuine interest', 2, '#3b82f6'),
  ('Proposal', 'Proposal or quote has been sent', 3, '#f59e0b'),
  ('Negotiation', 'In active negotiation phase', 4, '#ef4444'),
  ('Closed Won', 'Deal successfully closed', 5, '#10b981'),
  ('Closed Lost', 'Deal was lost', 6, '#6b7280');

-- Create updated_at trigger for pipeline stages
CREATE TRIGGER update_pipeline_stages_updated_at
  BEFORE UPDATE ON public.pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for lead activities
CREATE TRIGGER update_lead_activities_updated_at
  BEFORE UPDATE ON public.lead_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update last_activity_at on leads
CREATE OR REPLACE FUNCTION public.update_lead_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.leads 
  SET last_activity_at = now()
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_lead_last_activity_trigger
  AFTER INSERT OR UPDATE ON public.lead_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_last_activity();