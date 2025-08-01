-- Create integration_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_type') THEN
        CREATE TYPE integration_type AS ENUM ('xero', 'google_calendar', 'linkedin', 'twitter', 'unlimited_web_hosting');
    ELSE
        -- Add unlimited_web_hosting to existing enum if not already present
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'unlimited_web_hosting' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'integration_type')) THEN
            ALTER TYPE integration_type ADD VALUE 'unlimited_web_hosting';
        END IF;
    END IF;
END $$;

-- Update api_integrations table to use the enum if column exists without it
DO $$
BEGIN
    -- Check if integration_type column exists and update it to use the enum
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_integrations' AND column_name = 'integration_type') THEN
        -- Convert text column to enum if needed
        BEGIN
            ALTER TABLE api_integrations ALTER COLUMN integration_type TYPE integration_type USING integration_type::integration_type;
        EXCEPTION
            WHEN OTHERS THEN
                -- Column might already be enum type
                NULL;
        END;
    END IF;
END $$;