-- Make the uploads bucket public so portfolio images can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'uploads';

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Public read access for uploads" ON storage.objects;

-- Add RLS policy for public read access to uploads bucket
CREATE POLICY "Public read access for uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');