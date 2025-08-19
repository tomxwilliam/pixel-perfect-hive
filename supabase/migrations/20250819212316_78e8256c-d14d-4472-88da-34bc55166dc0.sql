-- Fix project workflow and add task templates
-- First, add approval_requested_at column if missing
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS approval_requested_at TIMESTAMP WITH TIME ZONE;

-- Create project task templates table for default tasks
CREATE TABLE IF NOT EXISTS project_task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type text NOT NULL,
  task_title text NOT NULL,
  task_description text,
  task_priority text DEFAULT 'medium',
  task_status text DEFAULT 'todo',
  estimated_hours numeric DEFAULT 0,
  order_sequence integer DEFAULT 0,
  is_milestone boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on task templates
ALTER TABLE project_task_templates ENABLE ROW LEVEL SECURITY;

-- Admin only access to task templates
CREATE POLICY "Admin only task templates" ON project_task_templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Insert default task templates for each project type
INSERT INTO project_task_templates (project_type, task_title, task_description, task_priority, estimated_hours, order_sequence, is_milestone) VALUES
-- Web Development Tasks
('web', 'Project Kickoff Meeting', 'Initial client meeting and requirements gathering', 'high', 2, 1, true),
('web', 'Technical Analysis', 'Analyze technical requirements and create architecture plan', 'high', 8, 2, false),
('web', 'Design Wireframes', 'Create initial wireframes and user flow diagrams', 'medium', 12, 3, false),
('web', 'UI/UX Design', 'Create detailed mockups and design system', 'medium', 16, 4, true),
('web', 'Frontend Development Setup', 'Setup development environment and basic structure', 'high', 6, 5, false),
('web', 'Backend API Development', 'Develop core API endpoints and database schema', 'high', 20, 6, false),
('web', 'Frontend Implementation', 'Implement UI components and integrate with API', 'medium', 24, 7, false),
('web', 'Testing & QA', 'Comprehensive testing and bug fixes', 'high', 12, 8, false),
('web', 'Client Review', 'Present completed work to client for feedback', 'medium', 2, 9, true),
('web', 'Deployment & Launch', 'Deploy to production and go live', 'high', 4, 10, true),

-- App Development Tasks  
('app', 'Project Planning', 'Define app requirements and technical specifications', 'high', 4, 1, true),
('app', 'Platform Architecture', 'Design cross-platform architecture and choose tech stack', 'high', 8, 2, false),
('app', 'UI/UX Design', 'Create app mockups and user experience flows', 'medium', 20, 3, true),
('app', 'Backend Development', 'Develop API endpoints and database structure', 'high', 30, 4, false),
('app', 'Frontend Development', 'Implement app screens and functionality', 'medium', 40, 5, false),
('app', 'Feature Integration', 'Integrate third-party services and APIs', 'medium', 16, 6, false),
('app', 'Testing (iOS/Android)', 'Test on multiple devices and platforms', 'high', 20, 7, false),
('app', 'App Store Preparation', 'Prepare app store listings and assets', 'medium', 8, 8, false),
('app', 'Beta Testing', 'Conduct user testing and gather feedback', 'medium', 12, 9, true),
('app', 'App Store Submission', 'Submit to app stores and launch', 'high', 4, 10, true),

-- Game Development Tasks
('game', 'Game Design Document', 'Create comprehensive game design and mechanics', 'high', 12, 1, true),
('game', 'Technical Design', 'Define game engine choice and technical architecture', 'high', 8, 2, false),
('game', 'Art Style Guide', 'Establish visual style and create art pipeline', 'medium', 16, 3, true),
('game', 'Core Gameplay Loop', 'Implement basic game mechanics and systems', 'high', 30, 4, false),
('game', 'Level Design', 'Create game levels and content', 'medium', 25, 5, false),
('game', 'Art Asset Creation', 'Create 2D/3D assets, animations, and effects', 'medium', 35, 6, false),
('game', 'Audio Implementation', 'Add music, sound effects, and audio systems', 'low', 12, 7, false),
('game', 'Playtesting', 'Internal testing and game balancing', 'high', 15, 8, false),
('game', 'Polish & Optimization', 'Bug fixes, performance optimization, and polish', 'medium', 20, 9, false),
('game', 'Release Preparation', 'Prepare for launch on target platforms', 'high', 8, 10, true),

-- AI Development Tasks
('ai', 'AI Requirements Analysis', 'Define AI capabilities and success metrics', 'high', 6, 1, true),
('ai', 'Data Analysis & Preparation', 'Analyze and prepare training datasets', 'high', 16, 2, false),
('ai', 'Model Architecture Design', 'Design AI model architecture and approach', 'high', 12, 3, false),
('ai', 'AI Model Development', 'Develop and train the AI model', 'high', 30, 4, true),
('ai', 'Integration Development', 'Create APIs and integration points', 'medium', 20, 5, false),
('ai', 'Testing & Validation', 'Test model accuracy and performance', 'high', 16, 6, false),
('ai', 'Frontend Interface', 'Create user interface for AI interaction', 'medium', 15, 7, false),
('ai', 'Performance Optimization', 'Optimize model performance and response times', 'medium', 12, 8, false),
('ai', 'Documentation', 'Create technical documentation and user guides', 'low', 8, 9, false),
('ai', 'Deployment & Monitoring', 'Deploy AI system and setup monitoring', 'high', 10, 10, true);

-- Function to create default tasks when a project is approved
CREATE OR REPLACE FUNCTION create_default_project_tasks(project_id_param uuid, project_type_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert default tasks based on project type
  INSERT INTO project_tasks (
    project_id,
    title,
    description,
    priority,
    status,
    estimated_hours,
    created_by,
    order_sequence,
    is_milestone
  )
  SELECT 
    project_id_param,
    task_title,
    task_description,
    task_priority,
    task_status,
    estimated_hours,
    (SELECT id FROM auth.users WHERE email LIKE '%@404codelab.com' LIMIT 1), -- Admin user
    order_sequence,
    is_milestone
  FROM project_task_templates
  WHERE project_type = project_type_param
  ORDER BY order_sequence;
  
  -- Calculate project completion after adding tasks
  PERFORM calculate_project_completion_enhanced(project_id_param);
END;
$$;

-- Update the approve_project function to handle workflow properly
CREATE OR REPLACE FUNCTION approve_project(project_id_param uuid, approval_decision text, approval_notes_param text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  project_record projects;
  customer_user_id UUID;
BEGIN
  -- Get project details
  SELECT * INTO project_record FROM projects WHERE id = project_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Update project approval status and set proper status
  UPDATE projects 
  SET 
    approval_status = approval_decision,
    approved_by = auth.uid(),
    approved_at = CASE WHEN approval_decision = 'approved' THEN NOW() ELSE NULL END,
    approval_notes = approval_notes_param,
    status = CASE 
      WHEN approval_decision = 'approved' THEN 'active'
      WHEN approval_decision = 'rejected' THEN 'cancelled'
      ELSE 'pending'
    END,
    updated_at = NOW()
  WHERE id = project_id_param;
  
  -- If approved, create default tasks
  IF approval_decision = 'approved' THEN
    PERFORM create_default_project_tasks(project_id_param, project_record.project_type);
    
    -- Add customer to project team
    INSERT INTO project_team_members (
      project_id,
      user_id,
      role,
      added_by,
      can_log_time,
      can_edit_tasks,
      can_view_budget
    ) VALUES (
      project_id_param,
      project_record.customer_id,
      'client',
      auth.uid(),
      false,
      false,
      true
    ) ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;
  
  -- Update approval record if exists
  UPDATE project_approvals 
  SET 
    status = approval_decision,
    responded_at = NOW(),
    comments = approval_notes_param
  WHERE project_id = project_id_param AND approval_type = 'project_creation';
  
  -- Send notification to customer
  SELECT customer_id INTO customer_user_id FROM projects WHERE id = project_id_param;
  
  PERFORM send_notification(
    customer_user_id,
    CASE 
      WHEN approval_decision = 'approved' THEN 'Project Approved!'
      WHEN approval_decision = 'rejected' THEN 'Project Update Required'
      ELSE 'Project Status Update'
    END,
    CASE 
      WHEN approval_decision = 'approved' THEN 'Your project "' || project_record.title || '" has been approved and work will begin shortly. You can now track progress in your project dashboard.'
      WHEN approval_decision = 'rejected' THEN 'Your project "' || project_record.title || '" requires revision. Please check the details and resubmit.'
      ELSE 'Your project "' || project_record.title || '" status has been updated to revision requested.'
    END,
    CASE 
      WHEN approval_decision = 'approved' THEN 'success'
      WHEN approval_decision = 'rejected' THEN 'error'
      ELSE 'warning'
    END,
    'project_approval',
    project_id_param,
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$;

-- Function to auto-create project request with proper workflow
CREATE OR REPLACE FUNCTION create_project_request(
  project_title text,
  project_description text,
  project_type_param text,
  estimated_budget numeric DEFAULT NULL,
  estimated_completion_date date DEFAULT NULL,
  requirements_json jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_project_id uuid;
  admin_user_id uuid;
BEGIN
  -- Get an admin user for approval process
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email LIKE '%@404codelab.com' 
  LIMIT 1;
  
  -- Create project with pending approval
  INSERT INTO projects (
    customer_id,
    title,
    description,
    project_type,
    budget,
    estimated_completion_date,
    requirements,
    status,
    approval_status,
    approval_requested_at,
    priority
  ) VALUES (
    auth.uid(),
    project_title,
    project_description,
    project_type_param::project_type,
    estimated_budget,
    estimated_completion_date,
    requirements_json,
    'pending',
    'pending',
    NOW(),
    'medium'
  ) RETURNING id INTO new_project_id;
  
  -- Create approval request record
  INSERT INTO project_approvals (
    project_id,
    approval_type,
    title,
    description,
    requested_by,
    approver_id,
    status
  ) VALUES (
    new_project_id,
    'project_creation',
    'New Project Approval Required',
    'Customer project request "' || project_title || '" requires approval before work can begin',
    auth.uid(),
    admin_user_id,
    'pending'
  );
  
  -- Notify admin of new approval request
  PERFORM send_notification(
    admin_user_id,
    'New Project Approval Required',
    'A new project "' || project_title || '" has been submitted by a customer and requires your approval.',
    'info',
    'project_approval',
    new_project_id,
    auth.uid(),
    '/admin/projects'
  );
  
  -- Notify customer that request was submitted
  PERFORM send_notification(
    auth.uid(),
    'Project Request Submitted',
    'Your project request "' || project_title || '" has been submitted for approval. You will be notified once it has been reviewed.',
    'info',
    'project_status',
    new_project_id,
    auth.uid()
  );
  
  RETURN new_project_id;
END;
$$;