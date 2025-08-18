-- Create enhanced project management schema

-- Create project status enum
CREATE TYPE project_status_type AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');

-- Create task status enum  
CREATE TYPE task_status_type AS ENUM ('todo', 'in_progress', 'review', 'completed', 'cancelled');

-- Create task priority enum
CREATE TYPE task_priority_type AS ENUM ('lowest', 'low', 'medium', 'high', 'highest');

-- Create team member role enum
CREATE TYPE team_role_type AS ENUM ('admin', 'project_manager', 'team_member', 'client_viewer');

-- Update projects table with enhanced fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_status project_status_type DEFAULT 'planning';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'custom';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  priority task_priority_type DEFAULT 'medium',
  status task_status_type DEFAULT 'todo',
  start_date DATE,
  due_date DATE,
  estimated_hours NUMERIC DEFAULT 0,
  actual_hours NUMERIC DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  position INTEGER DEFAULT 0,
  tags TEXT[],
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,
  milestone_id UUID REFERENCES project_milestones(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  mentions UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES file_uploads(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task time tracking table
CREATE TABLE IF NOT EXISTS task_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  description TEXT,
  is_billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project chat/discussions table
CREATE TABLE IF NOT EXISTS project_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,
  mentions UUID[],
  reply_to UUID REFERENCES project_discussions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project notifications table
CREATE TABLE IF NOT EXISTS project_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES project_tasks(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update project_team_members with enhanced role system
ALTER TABLE project_team_members DROP COLUMN IF EXISTS role;
ALTER TABLE project_team_members ADD COLUMN team_role team_role_type DEFAULT 'team_member';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_user_id ON project_notifications(user_id);

-- Enable RLS on all new tables
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_tasks
CREATE POLICY "Users can view tasks in their projects" ON project_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_team_members ptm
      WHERE ptm.project_id = project_tasks.project_id 
      AND ptm.user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_tasks.project_id 
      AND p.customer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create tasks in their projects" ON project_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_team_members ptm
      WHERE ptm.project_id = project_tasks.project_id 
      AND ptm.user_id = auth.uid()
      AND ptm.team_role IN ('admin', 'project_manager')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can update tasks in their projects" ON project_tasks
  FOR UPDATE USING (
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_team_members ptm
      WHERE ptm.project_id = project_tasks.project_id 
      AND ptm.user_id = auth.uid()
      AND ptm.team_role IN ('admin', 'project_manager')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can delete tasks in their projects" ON project_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM project_team_members ptm
      WHERE ptm.project_id = project_tasks.project_id 
      AND ptm.user_id = auth.uid()
      AND ptm.team_role IN ('admin', 'project_manager')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for task_comments
CREATE POLICY "Users can view comments on accessible tasks" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN project_team_members ptm ON ptm.project_id = pt.project_id
      WHERE pt.id = task_comments.task_id 
      AND ptm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create comments on accessible tasks" ON task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN project_team_members ptm ON ptm.project_id = pt.project_id
      WHERE pt.id = task_comments.task_id 
      AND ptm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for other tables
CREATE POLICY "Users can view attachments on accessible tasks" ON task_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN project_team_members ptm ON ptm.project_id = pt.project_id
      WHERE pt.id = task_attachments.task_id 
      AND ptm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can manage time entries on accessible tasks" ON task_time_entries
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN project_team_members ptm ON ptm.project_id = pt.project_id
      WHERE pt.id = task_time_entries.task_id 
      AND ptm.user_id = auth.uid()
      AND ptm.team_role IN ('admin', 'project_manager')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can manage discussions in their projects" ON project_discussions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_team_members ptm
      WHERE ptm.project_id = project_discussions.project_id 
      AND ptm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their notifications" ON project_notifications
  FOR ALL USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_tasks_updated_at 
  BEFORE UPDATE ON project_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at 
  BEFORE UPDATE ON task_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_discussions_updated_at 
  BEFORE UPDATE ON project_discussions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate project completion percentage
CREATE OR REPLACE FUNCTION calculate_project_completion_enhanced(project_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    completion_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks
    FROM project_tasks
    WHERE project_id = project_id_param AND parent_task_id IS NULL;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM project_tasks
    WHERE project_id = project_id_param 
    AND parent_task_id IS NULL 
    AND status = 'completed';
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    completion_percentage := ROUND((completed_tasks::numeric / total_tasks::numeric) * 100);
    
    UPDATE projects 
    SET completion_percentage = completion_percentage,
        actual_hours = (
            SELECT COALESCE(SUM(actual_hours), 0) 
            FROM project_tasks 
            WHERE project_tasks.project_id = project_id_param
        )
    WHERE id = project_id_param;
    
    RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;