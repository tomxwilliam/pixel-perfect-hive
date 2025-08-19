-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE project_status_type AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status_type AS ENUM ('todo', 'in_progress', 'review', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority_type AS ENUM ('lowest', 'low', 'medium', 'high', 'highest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE team_role_type AS ENUM ('admin', 'project_manager', 'team_member', 'client_viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update projects table with enhanced fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_status project_status_type DEFAULT 'planning';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'custom';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Update existing project_tasks table - first add new columns
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES auth.users(id);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS recurring_pattern JSONB;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES project_milestones(id);

-- Update existing data for task status
UPDATE project_tasks SET status = 'todo' WHERE status NOT IN ('todo', 'in_progress', 'review', 'completed', 'cancelled');
UPDATE project_tasks SET priority = 'medium' WHERE priority NOT IN ('lowest', 'low', 'medium', 'high', 'highest');

-- Now alter the column types
ALTER TABLE project_tasks 
  ALTER COLUMN status TYPE task_status_type USING 
    CASE 
      WHEN status = 'todo' THEN 'todo'::task_status_type
      WHEN status = 'in_progress' THEN 'in_progress'::task_status_type
      WHEN status = 'review' THEN 'review'::task_status_type
      WHEN status = 'completed' THEN 'completed'::task_status_type
      WHEN status = 'cancelled' THEN 'cancelled'::task_status_type
      ELSE 'todo'::task_status_type
    END;

ALTER TABLE project_tasks 
  ALTER COLUMN priority TYPE task_priority_type USING 
    CASE 
      WHEN priority = 'lowest' THEN 'lowest'::task_priority_type
      WHEN priority = 'low' THEN 'low'::task_priority_type
      WHEN priority = 'medium' THEN 'medium'::task_priority_type
      WHEN priority = 'high' THEN 'high'::task_priority_type
      WHEN priority = 'highest' THEN 'highest'::task_priority_type
      ELSE 'medium'::task_priority_type
    END;

-- Set defaults
ALTER TABLE project_tasks ALTER COLUMN status SET DEFAULT 'todo';
ALTER TABLE project_tasks ALTER COLUMN priority SET DEFAULT 'medium';

-- Create task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
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
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task time tracking table
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

-- Create project discussions table
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

-- Create project notifications table
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

-- Update project_team_members with enhanced role system
ALTER TABLE project_team_members DROP COLUMN IF EXISTS role;
ALTER TABLE project_team_members ADD COLUMN IF NOT EXISTS team_role team_role_type DEFAULT 'team_member';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_user_id ON project_notifications(user_id);