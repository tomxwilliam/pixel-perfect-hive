-- Enhanced Project Management System Database Schema

-- First, add new columns to existing projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS project_manager_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS template_id uuid,
ADD COLUMN IF NOT EXISTS parent_project_id uuid REFERENCES public.projects(id),
ADD COLUMN IF NOT EXISTS health_status text DEFAULT 'green' CHECK (health_status IN ('green', 'yellow', 'red')),
ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS deadline date,
ADD COLUMN IF NOT EXISTS actual_start_date date,
ADD COLUMN IF NOT EXISTS is_billable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS total_hours_logged numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS client_visible boolean DEFAULT true;

-- Create project templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    project_type project_type NOT NULL,
    default_budget numeric,
    estimated_duration_days integer,
    template_data jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    parent_task_id uuid REFERENCES public.project_tasks(id),
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to uuid REFERENCES auth.users(id),
    estimated_hours numeric,
    actual_hours numeric DEFAULT 0,
    start_date date,
    due_date date,
    completed_at timestamp with time zone,
    sort_order integer DEFAULT 0,
    tags text[],
    is_milestone boolean DEFAULT false,
    dependencies uuid[],
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    due_date date NOT NULL,
    completed_at timestamp with time zone,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'delayed')),
    completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    is_critical boolean DEFAULT false,
    deliverables text[],
    approval_required boolean DEFAULT false,
    approved_by uuid REFERENCES auth.users(id),
    approved_at timestamp with time zone,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project team members table
CREATE TABLE IF NOT EXISTS public.project_team_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'lead', 'member', 'client', 'stakeholder')),
    hourly_rate numeric,
    can_log_time boolean DEFAULT false,
    can_edit_tasks boolean DEFAULT false,
    can_view_budget boolean DEFAULT false,
    notification_preferences jsonb DEFAULT '{"task_assigned": true, "milestone_completed": true, "deadline_approaching": true}',
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    left_at timestamp with time zone,
    added_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- Create project time logs table
CREATE TABLE IF NOT EXISTS public.project_time_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    task_id uuid REFERENCES public.project_tasks(id),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    hours_logged numeric NOT NULL CHECK (hours_logged > 0),
    hourly_rate numeric,
    total_cost numeric,
    description text,
    work_date date NOT NULL DEFAULT CURRENT_DATE,
    is_billable boolean DEFAULT true,
    is_approved boolean DEFAULT false,
    approved_by uuid REFERENCES auth.users(id),
    approved_at timestamp with time zone,
    invoice_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project comments table
CREATE TABLE IF NOT EXISTS public.project_comments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    task_id uuid REFERENCES public.project_tasks(id),
    milestone_id uuid REFERENCES public.project_milestones(id),
    parent_comment_id uuid REFERENCES public.project_comments(id),
    author_id uuid NOT NULL REFERENCES auth.users(id),
    content text NOT NULL,
    is_internal boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    mentions uuid[],
    attachments text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    edited_at timestamp with time zone
);

-- Create project change requests table
CREATE TABLE IF NOT EXISTS public.project_change_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    reason text,
    impact_assessment text,
    estimated_hours numeric,
    estimated_cost numeric,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    requested_by uuid NOT NULL REFERENCES auth.users(id),
    reviewed_by uuid REFERENCES auth.users(id),
    approved_by uuid REFERENCES auth.users(id),
    requested_at timestamp with time zone NOT NULL DEFAULT now(),
    reviewed_at timestamp with time zone,
    approved_at timestamp with time zone,
    implemented_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project budgets table
CREATE TABLE IF NOT EXISTS public.project_budgets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    category text NOT NULL,
    budgeted_amount numeric NOT NULL,
    actual_amount numeric DEFAULT 0,
    description text,
    is_fixed_cost boolean DEFAULT false,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project resources table
CREATE TABLE IF NOT EXISTS public.project_resources (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    resource_type text NOT NULL CHECK (resource_type IN ('human', 'equipment', 'software', 'material', 'external')),
    resource_name text NOT NULL,
    description text,
    quantity numeric DEFAULT 1,
    unit_cost numeric,
    total_cost numeric,
    allocation_percentage integer DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    start_date date,
    end_date date,
    is_critical boolean DEFAULT false,
    notes text,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project risks table
CREATE TABLE IF NOT EXISTS public.project_risks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    risk_category text NOT NULL CHECK (risk_category IN ('technical', 'business', 'external', 'organizational', 'project_management')),
    probability text NOT NULL CHECK (probability IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    impact text NOT NULL CHECK (impact IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    risk_score integer,
    status text NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigated', 'closed', 'occurred')),
    mitigation_plan text,
    contingency_plan text,
    owner_id uuid REFERENCES auth.users(id),
    identified_by uuid NOT NULL REFERENCES auth.users(id),
    identified_at timestamp with time zone NOT NULL DEFAULT now(),
    review_date date,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project approvals table
CREATE TABLE IF NOT EXISTS public.project_approvals (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id uuid REFERENCES public.project_milestones(id),
    approval_type text NOT NULL CHECK (approval_type IN ('milestone', 'deliverable', 'change_request', 'budget', 'final')),
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    requested_by uuid NOT NULL REFERENCES auth.users(id),
    approver_id uuid NOT NULL REFERENCES auth.users(id),
    requested_at timestamp with time zone NOT NULL DEFAULT now(),
    responded_at timestamp with time zone,
    comments text,
    attachments text[],
    deadline date,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key for template_id in projects table
ALTER TABLE public.projects 
ADD CONSTRAINT fk_projects_template 
FOREIGN KEY (template_id) REFERENCES public.project_templates(id);

-- Enable RLS on all new tables
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project templates
CREATE POLICY "Admins can manage project templates" ON public.project_templates
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Anyone can view active templates" ON public.project_templates
FOR SELECT USING (is_active = true);

-- Create RLS policies for project tasks
CREATE POLICY "Admins can manage all project tasks" ON public.project_tasks
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Project team can view tasks" ON public.project_tasks
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = project_tasks.project_id 
        AND (
            p.customer_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM project_team_members ptm 
                WHERE ptm.project_id = p.id AND ptm.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Project team can update tasks" ON public.project_tasks
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM project_team_members ptm 
        JOIN projects p ON p.id = ptm.project_id
        WHERE ptm.project_id = project_tasks.project_id 
        AND ptm.user_id = auth.uid() 
        AND ptm.can_edit_tasks = true
    )
);

-- Create RLS policies for project milestones
CREATE POLICY "Admins can manage all milestones" ON public.project_milestones
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Project team can view milestones" ON public.project_milestones
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = project_milestones.project_id 
        AND (
            p.customer_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM project_team_members ptm 
                WHERE ptm.project_id = p.id AND ptm.user_id = auth.uid()
            )
        )
    )
);

-- Create RLS policies for project team members
CREATE POLICY "Admins can manage all team members" ON public.project_team_members
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Project customers can view team" ON public.project_team_members
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = project_team_members.project_id AND p.customer_id = auth.uid()
    )
);

CREATE POLICY "Team members can view team" ON public.project_team_members
FOR SELECT USING (user_id = auth.uid());

-- Create RLS policies for project time logs
CREATE POLICY "Admins can manage all time logs" ON public.project_time_logs
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can manage own time logs" ON public.project_time_logs
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Project team can view time logs" ON public.project_time_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM project_team_members ptm 
        WHERE ptm.project_id = project_time_logs.project_id 
        AND ptm.user_id = auth.uid()
        AND ptm.can_view_budget = true
    )
);

-- Create RLS policies for project comments
CREATE POLICY "Admins can manage all comments" ON public.project_comments
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can manage own comments" ON public.project_comments
FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Project team can view comments" ON public.project_comments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = project_comments.project_id 
        AND (
            p.customer_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM project_team_members ptm 
                WHERE ptm.project_id = p.id AND ptm.user_id = auth.uid()
            )
        )
    )
    AND (is_internal = false OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
);

-- Create RLS policies for remaining tables (similar pattern)
CREATE POLICY "Admins can manage change requests" ON public.project_change_requests
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Project team can view change requests" ON public.project_change_requests
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = project_change_requests.project_id 
        AND (
            p.customer_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM project_team_members ptm 
                WHERE ptm.project_id = p.id AND ptm.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Customers can create change requests" ON public.project_change_requests
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = project_change_requests.project_id AND p.customer_id = auth.uid()
    )
);

-- Similar policies for budgets, resources, risks, and approvals
CREATE POLICY "Admins can manage budgets" ON public.project_budgets
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can manage resources" ON public.project_resources
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can manage risks" ON public.project_risks
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can manage approvals" ON public.project_approvals
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Add updated_at triggers for all new tables
CREATE TRIGGER update_project_templates_updated_at
    BEFORE UPDATE ON public.project_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
    BEFORE UPDATE ON public.project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_time_logs_updated_at
    BEFORE UPDATE ON public.project_time_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at
    BEFORE UPDATE ON public.project_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_change_requests_updated_at
    BEFORE UPDATE ON public.project_change_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_budgets_updated_at
    BEFORE UPDATE ON public.project_budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_resources_updated_at
    BEFORE UPDATE ON public.project_resources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_risks_updated_at
    BEFORE UPDATE ON public.project_risks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_approvals_updated_at
    BEFORE UPDATE ON public.project_approvals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate project completion percentage
CREATE OR REPLACE FUNCTION public.calculate_project_completion(project_id_param uuid)
RETURNS integer AS $$
DECLARE
    total_tasks integer;
    completed_tasks integer;
    completion_percentage integer;
BEGIN
    SELECT COUNT(*) INTO total_tasks
    FROM project_tasks
    WHERE project_id = project_id_param;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM project_tasks
    WHERE project_id = project_id_param AND status = 'completed';
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    completion_percentage := ROUND((completed_tasks::numeric / total_tasks::numeric) * 100);
    
    UPDATE projects 
    SET completion_percentage = completion_percentage,
        total_hours_logged = (
            SELECT COALESCE(SUM(hours_logged), 0) 
            FROM project_time_logs 
            WHERE project_time_logs.project_id = project_id_param
        ),
        total_cost = (
            SELECT COALESCE(SUM(total_cost), 0) 
            FROM project_time_logs 
            WHERE project_time_logs.project_id = project_id_param AND is_billable = true
        )
    WHERE id = project_id_param;
    
    RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update project completion
CREATE OR REPLACE FUNCTION public.update_project_completion()
RETURNS trigger AS $$
BEGIN
    PERFORM public.calculate_project_completion(NEW.project_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_project_completion_tasks
    AFTER INSERT OR UPDATE OR DELETE ON public.project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_project_completion();

CREATE TRIGGER trigger_update_project_completion_time
    AFTER INSERT OR UPDATE OR DELETE ON public.project_time_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_project_completion();

-- Insert default project templates
INSERT INTO public.project_templates (name, description, project_type, default_budget, estimated_duration_days, template_data) VALUES
('Basic Website', 'Standard business website with 5-10 pages', 'web', 2500.00, 30, '{"pages": ["Home", "About", "Services", "Contact"], "features": ["responsive_design", "contact_form", "seo_basics"]}'),
('E-commerce Store', 'Full e-commerce solution with payment integration', 'web', 8000.00, 60, '{"pages": ["Home", "Shop", "Product Pages", "Cart", "Checkout"], "features": ["payment_gateway", "inventory_management", "user_accounts"]}'),
('Mobile App MVP', 'Minimum viable product for mobile application', 'app', 15000.00, 90, '{"platforms": ["iOS", "Android"], "features": ["user_authentication", "core_functionality", "basic_ui"]}'),
('Custom Web Application', 'Bespoke web application development', 'web', 12000.00, 75, '{"features": ["user_management", "database_integration", "api_development", "admin_panel"]}'),
('Game Prototype', 'Basic game prototype and concept validation', 'game', 5000.00, 45, '{"platforms": ["PC", "Mobile"], "features": ["core_gameplay", "basic_graphics", "sound_effects"]}');