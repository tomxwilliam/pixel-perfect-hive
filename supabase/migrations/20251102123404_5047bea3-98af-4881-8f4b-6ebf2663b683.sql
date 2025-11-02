-- CRITICAL SECURITY FIX: Replace all vulnerable RLS policies that check profiles.role
-- with secure has_role() function calls to prevent privilege escalation attacks
--
-- This migration addresses 37 vulnerable policies across 29 tables that were using
-- the insecure pattern: profiles.role = 'admin' which can be manipulated by attackers
--
-- Date: 2025-11-02
-- Severity: CRITICAL
-- Reference: https://docs.lovable.dev/features/security

-- ============================================================================
-- ACTIVITY LOG - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view all activity" ON activity_log;
CREATE POLICY "Admins can view all activity" 
  ON activity_log FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- ADMIN REQUESTS - 1 policy  
-- ============================================================================
DROP POLICY IF EXISTS "Admin only admin requests" ON admin_requests;
CREATE POLICY "Admin only admin requests" 
  ON admin_requests FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- AI AGENT SETTINGS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admin only ai settings" ON ai_agent_settings;
CREATE POLICY "Admin only ai settings" 
  ON ai_agent_settings FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- CALL BOOKINGS - 1 policy (mixed logic)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own bookings" ON call_bookings;
CREATE POLICY "Users can view own bookings" 
  ON call_bookings FOR SELECT 
  USING (
    (customer_id = auth.uid()) 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- ============================================================================
-- DOMAIN HOSTING SETTINGS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage domain hosting settings" ON domain_hosting_settings;
CREATE POLICY "Admins can manage domain hosting settings" 
  ON domain_hosting_settings FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- DOMAIN REGISTRATIONS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all domain registrations" ON domain_registrations;
CREATE POLICY "Admins can manage all domain registrations" 
  ON domain_registrations FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- EMAIL TEMPLATES - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admin only email templates" ON email_templates;
CREATE POLICY "Admin only email templates" 
  ON email_templates FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- FILE UPLOADS - 2 policies
-- ============================================================================
DROP POLICY IF EXISTS "users_can_delete_own_files" ON file_uploads;
CREATE POLICY "users_can_delete_own_files" 
  ON file_uploads FOR DELETE 
  USING (
    (user_id = auth.uid()) 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "users_can_view_own_files" ON file_uploads;
CREATE POLICY "users_can_view_own_files" 
  ON file_uploads FOR SELECT 
  USING (
    (user_id = auth.uid()) 
    OR (EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = file_uploads.entity_id 
        AND projects.customer_id = auth.uid()
    ))
    OR (EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = file_uploads.entity_id 
        AND tickets.customer_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- ============================================================================
-- MESSAGES - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can send messages to customers" ON messages;
CREATE POLICY "Admins can send messages to customers" 
  ON messages FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- NOTIFICATIONS - 2 policies
-- ============================================================================
DROP POLICY IF EXISTS "Admins can create notifications for customers" ON notifications;
CREATE POLICY "Admins can create notifications for customers" 
  ON notifications FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications" 
  ON notifications FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- ORDERS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders" 
  ON orders FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- ORG BILLING SETTINGS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admin only billing settings" ON org_billing_settings;
CREATE POLICY "Admin only billing settings" 
  ON org_billing_settings FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- PIPELINE STAGES - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admin only pipeline stages" ON pipeline_stages;
CREATE POLICY "Admin only pipeline stages" 
  ON pipeline_stages FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- PROJECT APPROVALS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage approvals" ON project_approvals;
CREATE POLICY "Admins can manage approvals" 
  ON project_approvals FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- PROJECT CHANGE REQUESTS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage change requests" ON project_change_requests;
CREATE POLICY "Admins can manage change requests" 
  ON project_change_requests FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- PROJECT DISCUSSIONS - 1 policy (mixed logic)
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage discussions in their projects" ON project_discussions;
CREATE POLICY "Users can manage discussions in their projects" 
  ON project_discussions FOR ALL 
  USING (
    (EXISTS (
      SELECT 1 FROM project_team_members ptm 
      WHERE ptm.project_id = project_discussions.project_id 
        AND ptm.user_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- ============================================================================
-- PROJECT RISKS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage risks" ON project_risks;
CREATE POLICY "Admins can manage risks" 
  ON project_risks FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- PROJECT TASKS - 5 policies (complex mixed logic)
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all project tasks" ON project_tasks;
CREATE POLICY "Admins can manage all project tasks" 
  ON project_tasks FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Project managers can delete tasks" ON project_tasks;
CREATE POLICY "Project managers can delete tasks" 
  ON project_tasks FOR DELETE 
  USING (
    (EXISTS (
      SELECT 1 FROM project_team_members ptm 
      WHERE ptm.project_id = project_tasks.project_id 
        AND ptm.user_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Users can create tasks in their projects" ON project_tasks;
CREATE POLICY "Users can create tasks in their projects" 
  ON project_tasks FOR INSERT 
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM project_team_members ptm 
      WHERE ptm.project_id = project_tasks.project_id 
        AND ptm.user_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Users can update tasks in their projects" ON project_tasks;
CREATE POLICY "Users can update tasks in their projects" 
  ON project_tasks FOR UPDATE 
  USING (
    (assignee_id = auth.uid()) 
    OR (assigned_to = auth.uid())
    OR (EXISTS (
      SELECT 1 FROM project_team_members ptm 
      WHERE ptm.project_id = project_tasks.project_id 
        AND ptm.user_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Users can view tasks in their projects" ON project_tasks;
CREATE POLICY "Users can view tasks in their projects" 
  ON project_tasks FOR SELECT 
  USING (
    (EXISTS (
      SELECT 1 FROM project_team_members ptm 
      WHERE ptm.project_id = project_tasks.project_id 
        AND ptm.user_id = auth.uid()
    ))
    OR (EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_tasks.project_id 
        AND p.customer_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- ============================================================================
-- PROJECT TEMPLATES - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage project templates" ON project_templates;
CREATE POLICY "Admins can manage project templates" 
  ON project_templates FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- PROJECT TIME LOGS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all time logs" ON project_time_logs;
CREATE POLICY "Admins can manage all time logs" 
  ON project_time_logs FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- PROJECTS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
CREATE POLICY "Admins can view all projects" 
  ON projects FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- SLA POLICIES - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admin only SLA policies" ON sla_policies;
CREATE POLICY "Admin only SLA policies" 
  ON sla_policies FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- TASK ATTACHMENTS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Users can view attachments on accessible tasks" ON task_attachments;
CREATE POLICY "Users can view attachments on accessible tasks" 
  ON task_attachments FOR SELECT 
  USING (
    (EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN project_team_members ptm ON ptm.project_id = pt.project_id
      WHERE pt.id = task_attachments.task_id 
        AND ptm.user_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- ============================================================================
-- TASK TIME ENTRIES - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage time entries" ON task_time_entries;
CREATE POLICY "Users can manage time entries" 
  ON task_time_entries FOR ALL 
  USING (
    (user_id = auth.uid())
    OR (EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN project_team_members ptm ON ptm.project_id = pt.project_id
      WHERE pt.id = task_time_entries.task_id 
        AND ptm.user_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- ============================================================================
-- TICKET ATTACHMENTS - 2 policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can upload attachments to their tickets" ON ticket_attachments;
CREATE POLICY "Users can upload attachments to their tickets" 
  ON ticket_attachments FOR INSERT 
  WITH CHECK (
    (uploaded_by = auth.uid()) 
    AND (EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_attachments.ticket_id 
        AND (
          tickets.customer_id = auth.uid() 
          OR has_role(auth.uid(), 'admin'::app_role)
        )
    ))
  );

DROP POLICY IF EXISTS "Users can view attachments for their tickets" ON ticket_attachments;
CREATE POLICY "Users can view attachments for their tickets" 
  ON ticket_attachments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_attachments.ticket_id 
        AND (
          tickets.customer_id = auth.uid() 
          OR has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );

-- ============================================================================
-- TICKET CATEGORIES - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage categories" ON ticket_categories;
CREATE POLICY "Admins can manage categories" 
  ON ticket_categories FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- TICKET INTERNAL NOTES - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage internal notes" ON ticket_internal_notes;
CREATE POLICY "Admins can manage internal notes" 
  ON ticket_internal_notes FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- TICKET WATCHERS - 2 policies
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage watchers" ON ticket_watchers;
CREATE POLICY "Admins can manage watchers" 
  ON ticket_watchers FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view watchers for their tickets" ON ticket_watchers;
CREATE POLICY "Users can view watchers for their tickets" 
  ON ticket_watchers FOR SELECT 
  USING (
    (user_id = auth.uid())
    OR (EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_watchers.ticket_id 
        AND (
          tickets.customer_id = auth.uid() 
          OR has_role(auth.uid(), 'admin'::app_role)
        )
    ))
  );

-- ============================================================================
-- WEBHOOK EVENTS - 1 policy
-- ============================================================================
DROP POLICY IF EXISTS "Admin only webhook events" ON webhook_events;
CREATE POLICY "Admin only webhook events" 
  ON webhook_events FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- VERIFICATION: Run this query to ensure no vulnerable policies remain
-- ============================================================================
-- SELECT tablename, policyname 
-- FROM pg_policies 
-- WHERE (qual LIKE '%profiles.role%' OR with_check LIKE '%profiles.role%')
--   AND schemaname = 'public';
-- 
-- Expected result: 0 rows (no vulnerable policies should remain)