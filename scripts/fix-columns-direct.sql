-- Direct SQL to fix missing columns in Railway PostgreSQL
-- Run this manually in Railway database console if migration script fails

-- Create enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GrindingMethod') THEN
        CREATE TYPE "GrindingMethod" AS ENUM ('MANUAL', 'AUTOMATIC', 'MIXER');
    END IF;
END
$$;

-- Add missing columns to graphene table
ALTER TABLE graphene ADD COLUMN IF NOT EXISTS base_type VARCHAR(255);
ALTER TABLE graphene ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);
ALTER TABLE graphene ADD COLUMN IF NOT EXISTS grinding_method "GrindingMethod";

-- Add missing columns to biochar table  
ALTER TABLE biochar ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);

-- Verify columns were added
SELECT 
    table_name,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('graphene', 'biochar') 
AND column_name IN ('base_type', 'research_team', 'grinding_method')
ORDER BY table_name, column_name;