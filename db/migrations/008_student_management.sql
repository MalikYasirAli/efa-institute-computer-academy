-- db/migrations/008_student_management.sql
-- Step 8: Student Management foundation
-- Adds students columns, sequences for student_id and registration_number, secure RPC for approving an application
-- Review and run in staging before production. Do NOT run this SQL in production without review.

-- 1) Add missing columns to students table (reusing existing table created in earlier migrations)
ALTER TABLE IF EXISTS students
  ADD COLUMN IF NOT EXISTS application_id text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS father_name text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS cnic text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS complete_address text,
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS course_id uuid,
  ADD COLUMN IF NOT EXISTS admission_date timestamptz,
  ADD COLUMN IF NOT EXISTS completion_date timestamptz,
  ADD COLUMN IF NOT EXISTS student_photo_path text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS fee_status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2) Ensure application_id in students is unique to avoid duplicate student creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_students_application_id') THEN
    CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_students_application_id ON students(application_id);
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- table may not exist in some environments; ignore
  NULL;
END$$;

-- 3) Sequences for student ID and registration number
-- student_seq generates numeric suffix for student_id
CREATE SEQUENCE IF NOT EXISTS student_seq START 1 OWNED BY NONE;

-- registration_seq should start at 786 to produce first registration EFA-<year>-0786
CREATE SEQUENCE IF NOT EXISTS registration_seq START 786 OWNED BY NONE;

-- 4) Functions to generate IDs
CREATE OR REPLACE FUNCTION generate_student_id() RETURNS text LANGUAGE sql AS $$
  SELECT format('EFA-%s-%s', to_char(now(),'YYYY'), lpad(nextval('student_seq')::text, 4, '0'));
$$;

CREATE OR REPLACE FUNCTION generate_registration_number() RETURNS text LANGUAGE sql AS $$
  SELECT format('EFA-%s-%s', to_char(now(),'YYYY'), lpad(nextval('registration_seq')::text, 4, '0'));
$$;

-- 5) Approve application & create student RPC (atomic)
-- SECURITY DEFINER: runs with function owner privileges; review owner and privileges before applying in production
CREATE OR REPLACE FUNCTION approve_application_and_create_student(p_application_id text)
RETURNS TABLE(student_id text, registration_number text, student_uuid uuid, application_id text, full_name text, course_id uuid, admission_date timestamptz) AS $$
DECLARE
  app_row RECORD;
  existing_student RECORD;
  v_student_id text;
  v_registration text;
  v_uuid uuid;
BEGIN
  -- Only allow admins to execute this RPC
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  -- Lock the application row to avoid races
  SELECT * INTO app_row FROM applications WHERE application_id = p_application_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'application_not_found';
  END IF;

  -- Only allow approving pending applications
  IF app_row.status IS DISTINCT FROM 'pending' AND app_row.status IS DISTINCT FROM 'Pending' THEN
    RAISE EXCEPTION 'application_not_pending';
  END IF;

  -- Prevent duplicate student creation for same application
  SELECT * INTO existing_student FROM students WHERE application_id = p_application_id LIMIT 1;
  IF FOUND THEN
    -- Return the existing student info without creating a new one
    student_id := existing_student.student_id;
    registration_number := existing_student.registration_number;
    student_uuid := existing_student.id;
    application_id := existing_student.application_id;
    full_name := existing_student.full_name;
    course_id := existing_student.course_id;
    admission_date := existing_student.admission_date;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Generate IDs using DB-safe sequences
  v_student_id := generate_student_id();
  v_registration := generate_registration_number();

  -- Insert student record
  INSERT INTO students (student_id, registration_number, application_id, full_name, father_name, date_of_birth, gender, cnic, mobile, whatsapp, email, complete_address, education, course_id, admission_date, student_photo_path, status, fee_status, created_at, updated_at)
  VALUES (
    v_student_id,
    v_registration,
    app_row.application_id,
    app_row.full_name,
    app_row.father_guardian_name,
    app_row.date_of_birth,
    app_row.gender,
    app_row.cnic_b_form,
    app_row.mobile_number,
    app_row.whatsapp_number,
    app_row.email,
    app_row.complete_address,
    app_row.education,
    app_row.course_id,
    now(),
    app_row.student_photo_path,
    'Active',
    'Pending',
    now(),
    now())
  RETURNING student_id, registration_number, id, application_id, full_name, course_id, admission_date INTO student_id, registration_number, v_uuid, application_id, full_name, course_id, admission_date;

  student_uuid := v_uuid;

  -- Update application status to Approved and updated_at
  UPDATE applications SET status = 'Approved', updated_at = now() WHERE application_id = p_application_id;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public so authenticated admin clients can call the RPC (the function enforces admin check)
GRANT EXECUTE ON FUNCTION approve_application_and_create_student(text) TO public;

-- 6) RLS policies on students
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;

-- Admins can SELECT students
CREATE POLICY IF NOT EXISTS "Admins can select students" ON students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

-- Admins can UPDATE student records
CREATE POLICY IF NOT EXISTS "Admins can update students" ON students
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  )
  WITH CHECK (
    -- Prevent changing system identifiers via UPDATE from client-side; check that system fields are unchanged if present
    (COALESCE(NEW.student_id, OLD.student_id) = OLD.student_id OR OLD.student_id IS NULL) AND
    (COALESCE(NEW.registration_number, OLD.registration_number) = OLD.registration_number OR OLD.registration_number IS NULL)
  );

-- Do NOT create any public SELECT/UPDATE/DELETE policies for students table.

-- 7) Audit trigger for student creation and updates
CREATE OR REPLACE FUNCTION fn_audit_student_changes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'student', NEW.id, 'created', current_setting('request.jwt.claims.email', true), json_build_object('student_id', NEW.student_id, 'application_id', NEW.application_id), now());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'student', NEW.id, 'updated', current_setting('request.jwt.claims.email', true), json_build_object('changed', hstore(OLD)::jsonb || hstore(NEW)::jsonb), now());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_student_changes_trigger ON students;
CREATE TRIGGER audit_student_changes_trigger
AFTER INSERT OR UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION fn_audit_student_changes();

-- 8) Constraints and indexes
ALTER TABLE IF EXISTS students
  ADD CONSTRAINT IF NOT EXISTS uq_students_student_id UNIQUE (student_id),
  ADD CONSTRAINT IF NOT EXISTS uq_students_registration_number UNIQUE (registration_number);

-- Add FK to applications(application_id) if applications.application_id is unique (it is created earlier)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'applications') THEN
    BEGIN
      ALTER TABLE students ADD CONSTRAINT fk_students_application_id FOREIGN KEY (application_id) REFERENCES applications(application_id);
    EXCEPTION WHEN duplicate_object THEN
      -- constraint already exists
      NULL;
    END;
  END IF;
END$$;

-- IMPORTANT: Review the SECURITY DEFINER functions' owner and privileges before applying in production. Ensure the function owner is not a superuser and that functions do not enable privilege escalation.
