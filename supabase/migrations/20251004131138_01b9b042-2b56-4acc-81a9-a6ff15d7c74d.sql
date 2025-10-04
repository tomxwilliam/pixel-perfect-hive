-- Phase 1: Critical Security Fix - Separate Roles Table (Fixed)

-- 1. Create new role enum (same values as user_role for compatibility)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'customer');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Migrate existing role data from profiles table (convert via text)
INSERT INTO public.user_roles (user_id, role)
SELECT id, (role::text)::app_role 
FROM profiles 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update is_admin_user() function to use new role system
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- 6. Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Update ALL RLS policies to use has_role() instead of profiles.role

-- quotes
DROP POLICY IF EXISTS "Admins can manage all quotes" ON quotes;
CREATE POLICY "Admins can manage all quotes"
ON quotes FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- invoices
DROP POLICY IF EXISTS "Admins can manage all invoices" ON invoices;
CREATE POLICY "Admins can manage all invoices"
ON invoices FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- availability_settings
DROP POLICY IF EXISTS "Admin only availability settings" ON availability_settings;
CREATE POLICY "Admin only availability settings"
ON availability_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- hosting_accounts
DROP POLICY IF EXISTS "Admins can manage all hosting accounts" ON hosting_accounts;
CREATE POLICY "Admins can manage all hosting accounts"
ON hosting_accounts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- lead_activities
DROP POLICY IF EXISTS "Admin only lead activities" ON lead_activities;
CREATE POLICY "Admin only lead activities"
ON lead_activities FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- project_team_members
DROP POLICY IF EXISTS "Admins can manage all team members" ON project_team_members;
CREATE POLICY "Admins can manage all team members"
ON project_team_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- oauth_connections
DROP POLICY IF EXISTS "Admins can manage all oauth connections" ON oauth_connections;
CREATE POLICY "Admins can manage all oauth connections"
ON oauth_connections FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- leads
DROP POLICY IF EXISTS "Admin only leads" ON leads;
CREATE POLICY "Admin only leads"
ON leads FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- hosting_packages
DROP POLICY IF EXISTS "Admins can manage hosting packages" ON hosting_packages;
CREATE POLICY "Admins can manage hosting packages"
ON hosting_packages FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- project_milestones
DROP POLICY IF EXISTS "Admins can manage all milestones" ON project_milestones;
CREATE POLICY "Admins can manage all milestones"
ON project_milestones FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- invoice_templates
DROP POLICY IF EXISTS "Admins can manage invoice templates" ON invoice_templates;
CREATE POLICY "Admins can manage invoice templates"
ON invoice_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- social_media_metrics
DROP POLICY IF EXISTS "Admin only social metrics" ON social_media_metrics;
CREATE POLICY "Admin only social metrics"
ON social_media_metrics FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- project_budgets
DROP POLICY IF EXISTS "Admins can manage budgets" ON project_budgets;
CREATE POLICY "Admins can manage budgets"
ON project_budgets FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ticket_surveys
DROP POLICY IF EXISTS "Admins can view all surveys" ON ticket_surveys;
CREATE POLICY "Admins can view all surveys"
ON ticket_surveys FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- hashtag_suggestions
DROP POLICY IF EXISTS "Admin only hashtag suggestions" ON hashtag_suggestions;
CREATE POLICY "Admin only hashtag suggestions"
ON hashtag_suggestions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- task_comments
DROP POLICY IF EXISTS "Users can create comments on accessible tasks" ON task_comments;
CREATE POLICY "Users can create comments on accessible tasks"
ON task_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_tasks pt
    JOIN project_team_members ptm ON ptm.project_id = pt.project_id
    WHERE pt.id = task_comments.task_id AND ptm.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Users can view comments on accessible tasks" ON task_comments;
CREATE POLICY "Users can view comments on accessible tasks"
ON task_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_tasks pt
    JOIN project_team_members ptm ON ptm.project_id = pt.project_id
    WHERE pt.id = task_comments.task_id AND ptm.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

-- project_resources
DROP POLICY IF EXISTS "Admins can manage resources" ON project_resources;
CREATE POLICY "Admins can manage resources"
ON project_resources FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- social_posts
DROP POLICY IF EXISTS "Admin only social posts" ON social_posts;
CREATE POLICY "Admin only social posts"
ON social_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- tickets
DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;
CREATE POLICY "Admins can view all tickets"
ON tickets FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ai_conversations
DROP POLICY IF EXISTS "Admins can view all conversations" ON ai_conversations;
CREATE POLICY "Admins can view all conversations"
ON ai_conversations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- blocked_dates
DROP POLICY IF EXISTS "Admin only blocked dates" ON blocked_dates;
CREATE POLICY "Admin only blocked dates"
ON blocked_dates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ticket_templates
DROP POLICY IF EXISTS "Admins can manage templates" ON ticket_templates;
CREATE POLICY "Admins can manage templates"
ON ticket_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- profiles
DROP POLICY IF EXISTS "profiles_admin_delete_all" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON profiles;

CREATE POLICY "profiles_admin_delete_all"
ON profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_admin_select_all"
ON profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_admin_update_all"
ON profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- email_logs
DROP POLICY IF EXISTS "Admin only email logs" ON email_logs;
CREATE POLICY "Admin only email logs"
ON email_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- knowledge_base_articles
DROP POLICY IF EXISTS "Admins can manage articles" ON knowledge_base_articles;
CREATE POLICY "Admins can manage articles"
ON knowledge_base_articles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- project_comments
DROP POLICY IF EXISTS "Admins can manage all comments" ON project_comments;
CREATE POLICY "Admins can manage all comments"
ON project_comments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Project team can view comments" ON project_comments;
CREATE POLICY "Project team can view comments"
ON project_comments FOR SELECT
USING (
  (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_comments.project_id 
    AND (p.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_team_members ptm
      WHERE ptm.project_id = p.id AND ptm.user_id = auth.uid()
    ))
  )) AND (is_internal = false OR public.has_role(auth.uid(), 'admin'))
);

-- service_pricing_defaults
DROP POLICY IF EXISTS "Admin only service pricing" ON service_pricing_defaults;
CREATE POLICY "Admin only service pricing"
ON service_pricing_defaults FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- project_task_templates
DROP POLICY IF EXISTS "Admin only task templates" ON project_task_templates;
CREATE POLICY "Admin only task templates"
ON project_task_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ticket_time_logs
DROP POLICY IF EXISTS "Admins can manage time logs" ON ticket_time_logs;
CREATE POLICY "Admins can manage time logs"
ON ticket_time_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to sync role changes from profiles to user_roles (temporary during migration)
CREATE OR REPLACE FUNCTION sync_profile_role_to_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    DELETE FROM user_roles WHERE user_id = NEW.id;
    IF NEW.role IS NOT NULL THEN
      INSERT INTO user_roles (user_id, role)
      VALUES (NEW.id, (NEW.role::text)::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER sync_profile_role_trigger
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_role_to_user_roles();