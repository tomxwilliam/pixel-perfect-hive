-- Add unlimited web hosting as integration type
DO $$ 
BEGIN
    -- Check if the enum value already exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'unlimited_web_hosting' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'integration_type')) THEN
        -- Add unlimited_web_hosting to integration_type enum if it doesn't exist
        ALTER TYPE integration_type ADD VALUE 'unlimited_web_hosting';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Ignore if already exists
END $$;