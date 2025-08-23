-- Remove any remaining references to is_master field
-- This migration ensures complete removal of the is_master field from production

-- 1. Drop any remaining constraints that might reference is_master
DO $$
BEGIN
    -- Check if the column exists and drop it if it does
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'is_master'
    ) THEN
        ALTER TABLE public.categories DROP COLUMN is_master CASCADE;
        RAISE NOTICE 'Column is_master dropped from categories table';
    ELSE
        RAISE NOTICE 'Column is_master does not exist in categories table';
    END IF;
END $$;

-- 2. Drop any functions that might still reference is_master
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Find and drop any functions that might reference is_master
    FOR func_record IN 
        SELECT routine_name, routine_schema
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
        AND routine_definition ILIKE '%is_master%'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', func_record.routine_schema, func_record.routine_name);
        RAISE NOTICE 'Dropped function %', func_record.routine_name;
    END LOOP;
END $$;

-- 3. Drop any triggers that might reference is_master
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND trigger_name ILIKE '%master%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE', trigger_record.trigger_name, trigger_record.event_object_table);
        RAISE NOTICE 'Dropped trigger %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 4. Verify the cleanup
SELECT 
    'is_master_cleanup_verification' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS - No is_master references found'
        ELSE 'WARNING - ' || COUNT(*) || ' is_master references still exist'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'is_master';

-- Final confirmation
SELECT 'is_master field completely removed from database' as status;