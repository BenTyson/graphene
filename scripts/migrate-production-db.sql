-- Manual migration to add missing columns for production database
-- Run this once in Railway PostgreSQL to add missing columns

-- Add missing columns to graphene table
ALTER TABLE graphene ADD COLUMN IF NOT EXISTS base_type VARCHAR(255);
ALTER TABLE graphene ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);

-- Add missing columns to biochar table if they don't exist
ALTER TABLE biochar ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);

-- Add missing enum type for grinding_method if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GrindingMethod') THEN
        CREATE TYPE "GrindingMethod" AS ENUM ('MANUAL', 'AUTOMATIC', 'MIXER');
    END IF;
END
$$;

-- Add grinding_method column if it doesn't exist
ALTER TABLE graphene ADD COLUMN IF NOT EXISTS grinding_method "GrindingMethod";

-- Add any other missing columns based on schema
-- (Add more ALTER statements as needed based on errors)

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'graphene' 
AND column_name IN ('base_type', 'research_team', 'grinding_method');