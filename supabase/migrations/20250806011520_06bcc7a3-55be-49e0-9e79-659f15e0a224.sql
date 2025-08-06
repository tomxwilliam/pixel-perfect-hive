-- Add foreign key constraints for quotes table to establish proper relationships

-- Add foreign key constraint for quotes.customer_id → profiles.id
ALTER TABLE public.quotes 
ADD CONSTRAINT quotes_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for quotes.project_id → projects.id  
ALTER TABLE public.quotes 
ADD CONSTRAINT quotes_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON public.quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at);