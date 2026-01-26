-- Check what tables exist in your database
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%chat%' 
  OR table_name LIKE '%user%'
ORDER BY table_name;
