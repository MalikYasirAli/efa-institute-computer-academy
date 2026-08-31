-- db/migrations/009_certificate_management.sql
-- Step 9: Certificate management and secure verification
-- Review and run in staging before production. Do NOT run in production without review.

-- 1) Create certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  registration_number text NOT NULL,
  certificate_number text NOT NULL,
  course_id uuid,
  issue_date date,
  completion_date date,
  marks text,
  grade text,
  major_content_areas text,
  certificate_file_path text,
  certificate_status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Constraints and indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);

-- Ensure registration_number references students.registration_number when students table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'students') THEN
    BEGIN
      ALTER TABLE certificates ADD CONSTRAINT fk_cert_student FOREIGN KEY (student_id) REFERENCES students(id);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END$$;

-- 3) Sequence and function for certificate_number generation
CREATE SEQUENCE IF NOT EXISTS certificate_seq START 1 OWNED BY NONE;

CREATE OR REPLACE FUNCTION generate_certificate_number() RETURNS text LANGUAGE sql AS $$
  SELECT format('EFA-CERT-%s-%s', to_char(now(),'YYYY'), lpad(nextval('certificate_seq')::text, 6, '0'));
$$;

-- 4) RPC to create certificate (admin only) — SECURITY DEFINER
CREATE OR REPLACE FUNCTION insert_certificate(
  p_student_id uuid,
  p_course_id uuid,
  p_issue_date date,
  p_completion_date date,
  p_marks text,
  p_grade text,
  p_major_content_areas text,
  p_certificate_file_path text
) RETURNS TABLE(certificate_number text, certificate_id uuid, student_id uuid, course_id uuid, issue_date date) AS $$
DECLARE
  v_student RECORD;
  v_cert_num text;
BEGIN
  -- Admin check
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  -- ensure student exists
  SELECT * INTO v_student FROM students WHERE id = p_student_id LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'student_not_found';
  END IF;

  -- generate certificate number
  v_cert_num := generate_certificate_number();

  INSERT INTO certificates (student_id, registration_number, certificate_number, course_id, issue_date, completion_date, marks, grade, major_content_areas, certificate_file_path, certificate_status, created_at, updated_at)
  VALUES (p_student_id, v_student.registration_number, v_cert_num, p_course_id, p_issue_date, p_completion_date, p_marks, p_grade, p_major_content_areas, p_certificate_file_path, 'Active', now(), now())
  RETURNING certificate_number, id, student_id, course_id, issue_date INTO certificate_number, certificate_id, student_id, course_id, issue_date;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public (function enforces admin role) — review in staging
GRANT EXECUTE ON FUNCTION insert_certificate(uuid, uuid, date, date, text, text, text, text) TO public;

-- 5) Secure verification RPC for public use
CREATE OR REPLACE FUNCTION verify_certificate(p_registration_number text, p_cnic text)
RETURNS TABLE(certificate_number text, student_name text, course_id uuid, registration_number text, completion_date date, issue_date date, certificate_status text) AS $$
DECLARE
  v_student RECORD;
  v_certificate RECORD;
BEGIN
  SELECT * INTO v_student FROM students WHERE registration_number = p_registration_number LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- verify CNIC matches
  IF coalesce(v_student.cnic, '') <> coalesce(p_cnic, '') THEN
    RETURN;
  END IF;

  -- find active certificate for student
  SELECT * INTO v_certificate FROM certificates WHERE student_id = v_student.id AND certificate_status = 'Active' ORDER BY created_at DESC LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  certificate_number := v_certificate.certificate_number;
  student_name := v_student.full_name;
  course_id := v_certificate.course_id;
  registration_number := v_student.registration_number;
  completion_date := v_certificate.completion_date;
  issue_date := v_certificate.issue_date;
  certificate_status := v_certificate.certificate_status;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verify_certificate(text, text) TO public;

-- 6) RLS: enable on certificates and create admin policies
ALTER TABLE IF EXISTS certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can select certificates" ON certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can insert certificates" ON certificates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update certificates" ON certificates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can delete certificates" ON certificates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

-- Do not create public policies that allow direct SELECT on certificates or students.

-- 7) Audit trigger for certificates
CREATE OR REPLACE FUNCTION fn_audit_certificate_changes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'certificate', NEW.id, 'created', current_setting('request.jwt.claims.email', true), json_build_object('certificate_number', NEW.certificate_number, 'student_id', NEW.student_id), now());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'certificate', NEW.id, 'updated', current_setting('request.jwt.claims.email', true), json_build_object('changed', hstore(OLD)::jsonb || hstore(NEW)::jsonb), now());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'certificate', OLD.id, 'deleted', current_setting('request.jwt.claims.email', true), json_build_object('certificate_number', OLD.certificate_number, 'student_id', OLD.student_id), now());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_certificate_changes_trigger ON certificates;
CREATE TRIGGER audit_certificate_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON certificates
FOR EACH ROW
EXECUTE FUNCTION fn_audit_certificate_changes();

-- WARNING: Review SECURITY DEFINER functions and their owners. Test thoroughly in staging.
