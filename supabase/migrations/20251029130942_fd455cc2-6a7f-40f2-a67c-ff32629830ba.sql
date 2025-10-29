-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create the cron job to publish scheduled posts every 15 minutes
SELECT cron.schedule(
  'publish-scheduled-blog-posts',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT
    net.http_post(
      url:='https://ucsxwhnscgbcshaghyrq.supabase.co/functions/v1/publish-scheduled-posts',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjc3h3aG5zY2diY3NoYWdoeXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODk2NTQsImV4cCI6MjA2ODI2NTY1NH0.kaxOo5GxtF-ONAP33wEl3RFTZEtoqk41ZOd8uczsUGg"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Add comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - used to auto-publish scheduled blog posts';
