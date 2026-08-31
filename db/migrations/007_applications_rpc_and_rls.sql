-- db/migrations/007_applications_rpc_and_rls.sql
-- Step 7: Extend applications table and add secure RPCs and RLS policies for admission workflow
-- REVIEW before applying. Run in staging first.

-- 1) Add missing columns to applications table (if not exists)
ALTER TABLE IF EXISTS applications
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS father_guardian_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS cnic_b_form text,
  ADD COLUMN IF NOT EXISTS mobile_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS complete_address text,
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS previous_computer_experience text,
  ADD COLUMN IF NOT EXISTS additional_information text,
  ADD COLUMN IF NOT EXISTS student_photo_path text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure application_id uniqueness already exists from earlier migrations; create index if not
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_application_id ON applications(application_id);

-- 2) Create a sequence for application numbers to ensure DB-safe uniqueness
CREATE SEQUENCE IF NOT EXISTS application_seq START 1 OWNED BY NONE;

-- 3) Function to generate formatted application id
CREATE OR REPLACE FUNCTION generate_application_id() RETURNS text LANGUAGE sql AS $$
  SELECT format('EFA-APP-%s-%s', to_char(now(),'YYYY'), lpad(nextval('application_seq')::text, 4, '0'));
$$;

-- 4) Secure insert RPC: inserts an application and returns only the safe, public-facing fields
-- This function is SECURITY DEFINER and should be owned by a secure role (review before applying)
CREATE OR REPLACE FUNCTION insert_application(
  p_full_name text,
  p_father_guardian_name text,
  p_date_of_birth date,
  p_gender text,
  p_cnic_b_form text,
  p_mobile_number text,
  p_whatsapp_number text,
  p_email text,
  p_complete_address text,
  p_education text,
  p_course_slug text,
  p_previous_computer_experience text,
  p_additional_information text,
  p_student_photo_path text
) RETURNS TABLE(application_id text, status text, course_id uuid, created_at timestamptz) AS $$
DECLARE
  v_course_id uuid;
  v_app_id text;
  v_status text := 'Pending';
  v_created timestamptz;
BEGIN
  -- resolve course by slug (only published courses allowed)
  SELECT id INTO v_course_id FROM courses WHERE slug = p_course_slug AND published IS TRUE LIMIT 1;
  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Course not available';
  END IF;

  v_app_id := generate_application_id();

  INSERT INTO applications (application_id, full_name, father_guardian_name, date_of_birth, gender, cnic_b_form, mobile_number, whatsapp_number, email, complete_address, education, course_id, previous_computer_experience, additional_information, student_photo_path, status, created_at, updated_at)
  VALUES (v_app_id, p_full_name, p_father_guardian_name, p_date_of_birth, p_gender, p_cnic_b_form, p_mobile_number, p_whatsapp_number, p_email, p_complete_address, p_education, v_course_id, p_previous_computer_experience, p_additional_information, p_student_photo_path, v_status, now(), now())
  RETURNING application_id, status, course_id, created_at INTO application_id, status, course_id, created_at;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon (or public) so it can be called from the client app. Review in staging.
GRANT EXECUTE ON FUNCTION insert_application(text, text, date, text, text, text, text, text, text, text, text, text, text, text) TO public;

-- 5) Verification RPC: verifies an application by application_id + cnic_b_form and returns only safe fields
CREATE OR REPLACE FUNCTION verify_application(p_application_id text, p_cnic_b_form text)
RETURNS TABLE(application_id text, full_name text, course_id uuid, status text, created_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT application_id, full_name, course_id, status, created_at
  FROM applications
  WHERE application_id = p_application_id
    AND cnic_b_form = p_cnic_b_form
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verify_application(text, text) TO public;

-- 6) RLS: enable RLS and create narrow policies for admin access
ALTER TABLE IF EXISTS applications ENABLE ROW LEVEL SECURITY;

-- Policy: allow admins to SELECT applications (populate profiles table with admin rows)
CREATE POLICY IF NOT EXISTS "Admins can select applications" ON applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

-- Policy: allow admins to UPDATE applications (for status changes).
CREATE POLICY IF NOT EXISTS "Admins can update applications" ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  )
  WITH CHECK (
    -- allow status transitions only (frontend should restrict allowed statuses)
    (COALESCE(NEW.status, '') <> '')
  );

-- Do NOT create public SELECT policy on applications. Inserts should be done via the secure RPC insert_application.

-- 7) Audit trigger: record status changes
CREATE OR REPLACE FUNCTION fn_audit_application_status_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'application', NEW.id, 'status_update', current_setting('request.jwt.claims.email', true), json_build_object('old', OLD.status, 'new', NEW.status), now());
  END IF;
  RETURN NEW;
END;
$$;

-- Attach audit trigger to applications
DROP TRIGGER IF EXISTS audit_application_status_trigger ON applications;
CREATE TRIGGER audit_application_status_trigger
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION fn_audit_application_status_change();

-- IMPORTANT: Review all of the above in a staging environment. SECURITY DEFINER functions run with the privileges of the function owner — ensure the owner is a secure role and that the function does not allow privilege escalation.
