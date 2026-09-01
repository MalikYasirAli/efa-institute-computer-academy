-- db/migrations/011_attendance_management.sql
-- Step 11: Attendance Management
-- Review and run in staging before production. Do NOT run in production without review.

-- 1) Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  attendance_date date NOT NULL,
  status text NOT NULL DEFAULT 'Absent', -- Present, Absent, Leave
  check_in_time timestamptz,
  check_out_time timestamptz,
  notes text,
  marked_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Indexes and constraints
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

-- 3) Prevent duplicate daily attendance records per student
ALTER TABLE attendance
  ADD CONSTRAINT IF NOT EXISTS uq_attendance_student_date UNIQUE (student_id, attendance_date);

-- 4) Foreign key to students (if students table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'students') THEN
    BEGIN
      ALTER TABLE attendance ADD CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END$$;

-- 5) Controlled attendance statuses
ALTER TABLE attendance ADD CONSTRAINT IF NOT EXISTS chk_attendance_status CHECK (status IN ('Present','Absent','Leave'));

-- 6) Admin RPC to create attendance (atomic)
CREATE OR REPLACE FUNCTION create_attendance_admin(
  p_student_id uuid,
  p_attendance_date date,
  p_status text,
  p_check_in timestamptz,
  p_check_out timestamptz,
  p_notes text
) RETURNS TABLE(attendance_id uuid, student_id uuid, attendance_date date, status text) AS $$
DECLARE
  v_student RECORD;
  v_row RECORD;
BEGIN
  -- Admin check
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  -- Verify student exists
  SELECT * INTO v_student FROM students WHERE id = p_student_id LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'student_not_found';
  END IF;

  -- Upsert: ensure single record per student/date
  INSERT INTO attendance (student_id, attendance_date, status, check_in_time, check_out_time, notes, marked_by, created_at, updated_at)
  VALUES (p_student_id, p_attendance_date, p_status, p_check_in, p_check_out, p_notes, current_setting('request.jwt.claims.email', true), now(), now())
  ON CONFLICT (student_id, attendance_date) DO UPDATE
    SET status = EXCLUDED.status,
        check_in_time = EXCLUDED.check_in_time,
        check_out_time = EXCLUDED.check_out_time,
        notes = EXCLUDED.notes,
        marked_by = current_setting('request.jwt.claims.email', true),
        updated_at = now()
  RETURNING id, student_id, attendance_date, status INTO attendance_id, student_id, attendance_date, status;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public (function enforces admin role internally). Review owner & privileges in staging.
GRANT EXECUTE ON FUNCTION create_attendance_admin(uuid, date, text, timestamptz, timestamptz, text) TO public;

-- 7) Admin RPC to update attendance
CREATE OR REPLACE FUNCTION update_attendance_admin(p_attendance_id uuid, p_status text, p_check_in timestamptz, p_check_out timestamptz, p_notes text) RETURNS TABLE(attendance_id uuid, status text, updated_at timestamptz) AS $$
DECLARE
  v_row RECORD;
BEGIN
  -- Admin check
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  SELECT * INTO v_row FROM attendance WHERE id = p_attendance_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'attendance_not_found';
  END IF;

  UPDATE attendance
  SET status = COALESCE(p_status, status),
      check_in_time = COALESCE(p_check_in, check_in_time),
      check_out_time = COALESCE(p_check_out, check_out_time),
      notes = COALESCE(p_notes, notes),
      marked_by = current_setting('request.jwt.claims.email', true),
      updated_at = now()
  WHERE id = p_attendance_id
  RETURNING id, status, updated_at INTO attendance_id, status, updated_at;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_attendance_admin(uuid, text, timestamptz, timestamptz, text) TO public;

-- 8) RLS on attendance: only admins can operate
ALTER TABLE IF EXISTS attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can select attendance" ON attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can insert attendance" ON attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update attendance" ON attendance
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

CREATE POLICY IF NOT EXISTS "Admins can delete attendance" ON attendance
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

-- 9) Audit trigger for attendance
CREATE OR REPLACE FUNCTION fn_audit_attendance_changes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'attendance', NEW.id, 'created', current_setting('request.jwt.claims.email', true), json_build_object('student_id', NEW.student_id, 'attendance_date', NEW.attendance_date, 'status', NEW.status), now());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'attendance', NEW.id, 'updated', current_setting('request.jwt.claims.email', true), json_build_object('changed', hstore(OLD)::jsonb || hstore(NEW)::jsonb), now());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'attendance', OLD.id, 'deleted', current_setting('request.jwt.claims.email', true), json_build_object('student_id', OLD.student_id, 'attendance_date', OLD.attendance_date, 'status', OLD.status), now());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_attendance_changes_trigger ON attendance;
CREATE TRIGGER audit_attendance_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON attendance
FOR EACH ROW
EXECUTE FUNCTION fn_audit_attendance_changes();

-- 10) Warnings
-- Review SECURITY DEFINER functions' owners. Ensure they run with a minimal-privilege role and do not allow privilege escalation.
-- Ensure the developers create appropriate UI and only admins call the admin RPCs. Do not grant excessive execute rights in production without review.
