-- Add scheduling columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_published BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN blog_posts.scheduled_for IS 'When a scheduled post should be auto-published';
COMMENT ON COLUMN blog_posts.auto_published IS 'Flag to track if post was auto-published by cron job';

-- Update the check constraint to allow 'scheduled' status
-- First drop the existing constraint if it exists
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;

-- Add new constraint with 'scheduled' status
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_status_check 
CHECK (status IN ('draft', 'published', 'scheduled'));

-- Create index on scheduled_for for efficient cron queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled 
ON blog_posts(scheduled_for) 
WHERE status = 'scheduled';