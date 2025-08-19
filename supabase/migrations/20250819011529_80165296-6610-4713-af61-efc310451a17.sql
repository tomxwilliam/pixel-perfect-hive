-- Add RLS policies and new tables only
-- Enable RLS on project_tasks if not already enabled
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Add new columns to project_tasks
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES auth.users(id);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS recurring_pattern JSONB;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES project_milestones(id);

-- Create new tables for task management
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  mentions UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES file_uploads(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  description TEXT,
  is_billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  mentions UUID[],
  reply_to UUID REFERENCES project_discussions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES project_tasks(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
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
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_team_members ptm
      WHERE ptm.project_id = project_tasks.project_id 
      AND ptm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Project managers can delete tasks" ON project_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM project_team_members ptm
      WHERE ptm.project_id = project_tasks.project_id 
      AND ptm.user_id = auth.uid()
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

CREATE POLICY "Users can manage time entries" ON task_time_entries
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN project_team_members ptm ON ptm.project_id = pt.project_id
      WHERE pt.id = task_time_entries.task_id 
      AND ptm.user_id = auth.uid()
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_user_id ON project_notifications(user_id);