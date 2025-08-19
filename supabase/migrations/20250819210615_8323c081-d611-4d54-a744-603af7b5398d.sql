-- Add approval status and request functionality to projects
ALTER TABLE public.projects 
ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'revision_requested')),
ADD COLUMN approval_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approval_notes TEXT;

-- Create index for better performance
CREATE INDEX idx_projects_approval_status ON public.projects(approval_status);

-- Create function to handle lead conversion to project
CREATE OR REPLACE FUNCTION public.convert_lead_to_project(
  lead_id_param UUID,
  project_title TEXT,
  project_description TEXT DEFAULT NULL,
  project_type TEXT DEFAULT 'web',
  estimated_budget NUMERIC DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_record leads;
  new_project_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get lead details
  SELECT * INTO lead_record FROM leads WHERE id = lead_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;
  
  -- Get first admin user for approval
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email LIKE '%@404codelab.com' 
  LIMIT 1;
  
  -- Create customer profile if doesn't exist
  INSERT INTO profiles (id, email, first_name, last_name, company_name, phone, role)
  VALUES (
    COALESCE(lead_record.customer_id, gen_random_uuid()),
    lead_record.email,
    COALESCE(split_part(lead_record.name, ' ', 1), ''),
    COALESCE(split_part(lead_record.name, ' ', 2), ''),
    lead_record.company,
    lead_record.phone,
    'customer'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Create project with approval pending
  INSERT INTO projects (
    customer_id,
    title,
    description,
    project_type,
    budget,
    status,
    approval_status,
    priority,
    requirements
  ) VALUES (
    COALESCE(lead_record.customer_id, (SELECT id FROM profiles WHERE email = lead_record.email LIMIT 1)),
    project_title,
    project_description,
    project_type::project_type,
    estimated_budget,
    'pending',
    'pending',
    'medium',
    jsonb_build_object(
      'converted_from_lead', true,
      'lead_id', lead_id_param,
      'deal_value', lead_record.deal_value,
      'source', lead_record.source,
      'notes', lead_record.notes
    )
  ) RETURNING id INTO new_project_id;
  
  -- Mark lead as converted
  UPDATE leads 
  SET 
    converted_to_customer = true,
    customer_id = COALESCE(lead_record.customer_id, (SELECT id FROM profiles WHERE email = lead_record.email LIMIT 1)),
    updated_at = NOW()
  WHERE id = lead_id_param;
  
  -- Create approval request
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
    'Project converted from lead requires approval before proceeding',
    admin_user_id,
    admin_user_id,
    'pending'
  );
  
  -- Send notification to admin
  PERFORM send_notification(
    admin_user_id,
    'New Project Requires Approval',
    'A new project "' || project_title || '" has been created and requires your approval.',
    'info',
    'project_approval',
    new_project_id,
    admin_user_id
  );
  
  RETURN new_project_id;
END;
$$;

-- Create function to approve/reject project
CREATE OR REPLACE FUNCTION public.approve_project(
  project_id_param UUID,
  approval_decision TEXT, -- 'approved', 'rejected', 'revision_requested'
  approval_notes_param TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Update project approval status
  UPDATE projects 
  SET 
    approval_status = approval_decision,
    approved_by = auth.uid(),
    approved_at = CASE WHEN approval_decision = 'approved' THEN NOW() ELSE NULL END,
    approval_notes = approval_notes_param,
    status = CASE 
      WHEN approval_decision = 'approved' THEN 'in_progress'
      WHEN approval_decision = 'rejected' THEN 'cancelled'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = project_id_param;
  
  -- Update approval record
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
      WHEN approval_decision = 'approved' THEN 'Your project "' || project_record.title || '" has been approved and work will begin shortly.'
      WHEN approval_decision = 'rejected' THEN 'Your project "' || project_record.title || '" requires revision. Please check the details.'
      ELSE 'Your project "' || project_record.title || '" status has been updated.'
    END,
    CASE 
      WHEN approval_decision = 'approved' THEN 'success'
      WHEN approval_decision = 'rejected' THEN 'warning'
      ELSE 'info'
    END,
    'project_update',
    project_id_param,
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$;