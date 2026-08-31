-- db/rls/005_public_read_views_and_policies.sql
-- This file creates a safe public view for academy settings (excluding protected fields)
-- and enables a minimal RLS policy for selecting published courses.

-- VIEW: public_academy_settings (excludes protected_instructor_name)
CREATE OR REPLACE VIEW public_academy_settings AS
SELECT
  id,
  academy_name,
  display_name,
  address,
  phone_primary,
  phone_secondary,
  email,
  hours,
  director_name,
  created_at,
  updated_at
FROM academy_settings;

-- Grant select on the view to the public role (safe for read-only public data)
GRANT SELECT ON public_academy_settings TO public;

-- Enable Row Level Security on courses and create a safe SELECT policy for published courses
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;

-- Policy: allow anonymous/public SELECT only for published courses
CREATE POLICY IF NOT EXISTS "Public select published courses" ON courses
  FOR SELECT
  USING (published IS TRUE);

-- Note: Do NOT create broad RLS policies for sensitive tables (students, applications, payments, profiles, audit_logs).
-- Apply these SQL statements through your Supabase migration process in a staging environment, review, and then apply to production.
