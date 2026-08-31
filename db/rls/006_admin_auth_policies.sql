-- db/rls/006_admin_auth_policies.sql
-- RLS policy suggestions for admin authentication and profiles
-- WARNING: Review these statements in a staging environment before applying to production.

-- Enable RLS on profiles (if not already enabled)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to SELECT their own profile
CREATE POLICY IF NOT EXISTS "Select own profile" ON profiles
  FOR SELECT
  USING (auth_uid::text = auth.uid()::text);

-- Policy: allow admins to SELECT profiles
-- Note: This policy assumes the profiles table contains a 'role' column set to 'admin' for admin users.
-- Because RLS policies cannot reference the same table directly in a safe manner on all setups, test carefully.

CREATE POLICY IF NOT EXISTS "Admins can select profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

-- Do NOT grant broad access. Do not create public policies for sensitive tables (students, applications, payments, audit_logs).

-- Admin bootstrap:
-- Create admin profile rows manually in the database or use a secure server-side process.
-- Example (run in SQL editor as an admin, not from client-side):
-- INSERT INTO profiles (auth_uid, email, full_name, role, is_protected) VALUES ('<auth-uid>', 'admin@example.com', 'Site Admin', 'admin', true);

-- After applying policies, test thoroughly in staging. Adjust policies to match your authentication claims and organization needs.
