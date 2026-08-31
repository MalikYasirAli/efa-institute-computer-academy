-- db/migrations/010_fee_payment_management.sql
-- Step 10: Fee and Payment Management foundation
-- Review and run in staging before production. Do NOT run in production without review.

-- 1) Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  payment_ref text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'PKR',
  payment_method text,
  payment_date timestamptz,
  status text DEFAULT 'Pending', -- Pending, Submitted, Verified, Rejected
  proof_file_path text,
  verified_by text,
  verified_at timestamptz,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Indexes and constraints
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_payment_ref ON payments(payment_ref);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);

-- 3) Foreign key to students (if students table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'students') THEN
    BEGIN
      ALTER TABLE payments ADD CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES students(id);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END$$;

-- 4) Sequence & function for payment reference generation
CREATE SEQUENCE IF NOT EXISTS payment_seq START 1 OWNED BY NONE;

CREATE OR REPLACE FUNCTION generate_payment_ref() RETURNS text LANGUAGE sql AS $$
  SELECT format('EFA-PAY-%s-%s', to_char(now(),'YYYY'), lpad(nextval('payment_seq')::text, 6, '0'));
$$;

-- 5) Secure RPC for admin to create payment record atomically
CREATE OR REPLACE FUNCTION create_payment_admin(
  p_student_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_payment_date timestamptz,
  p_proof_file_path text,
  p_admin_notes text
) RETURNS TABLE(payment_ref text, payment_id uuid, student_id uuid, amount numeric, status text) AS $$
DECLARE
  v_student RECORD;
  v_ref text;
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

  v_ref := generate_payment_ref();

  INSERT INTO payments (student_id, payment_ref, amount, payment_method, payment_date, status, proof_file_path, admin_notes, created_at, updated_at)
  VALUES (p_student_id, v_ref, COALESCE(p_amount,0), p_payment_method, p_payment_date, 'Submitted', p_proof_file_path, p_admin_notes, now(), now())
  RETURNING payment_ref, id, student_id, amount, status INTO payment_ref, payment_id, student_id, amount, status;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public (function enforces admin role internally). Review in staging.
GRANT EXECUTE ON FUNCTION create_payment_admin(uuid, numeric, text, timestamptz, text, text) TO public;

-- 6) RPC for admins to update payment status (verify/reject)
CREATE OR REPLACE FUNCTION set_payment_status_admin(p_payment_ref text, p_new_status text, p_notes text) RETURNS TABLE(payment_ref text, payment_id uuid, status text, verified_by text, verified_at timestamptz) AS $$
DECLARE
  v_payments RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  SELECT * INTO v_payments FROM payments WHERE payment_ref = p_payment_ref FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment_not_found';
  END IF;

  UPDATE payments SET status = p_new_status, admin_notes = COALESCE(p_notes, admin_notes), verified_by = current_setting('request.jwt.claims.email', true), verified_at = CASE WHEN lower(p_new_status) = 'verified' THEN now() ELSE NULL END, updated_at = now()
  WHERE payment_ref = p_payment_ref
  RETURNING payment_ref, id, status, verified_by, verified_at INTO payment_ref, payment_id, status, verified_by, verified_at;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_payment_status_admin(text, text, text) TO public;

-- 7) RLS on payments: only admins can SELECT/UPDATE/DELETE; no public SELECT
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can select payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can insert payments" ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update payments" ON payments
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

CREATE POLICY IF NOT EXISTS "Admins can delete payments" ON payments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.auth_uid::text = auth.uid()::text AND p.role = 'admin'
    )
  );

-- 8) Audit trigger for payments
CREATE OR REPLACE FUNCTION fn_audit_payment_changes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'payment', NEW.id, 'created', current_setting('request.jwt.claims.email', true), json_build_object('payment_ref', NEW.payment_ref, 'student_id', NEW.student_id, 'amount', NEW.amount), now());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'payment', NEW.id, 'updated', current_setting('request.jwt.claims.email', true), json_build_object('changed', hstore(OLD)::jsonb || hstore(NEW)::jsonb), now());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (id, entity, entity_id, action, changed_by, payload, created_at)
    VALUES (gen_random_uuid(), 'payment', OLD.id, 'deleted', current_setting('request.jwt.claims.email', true), json_build_object('payment_ref', OLD.payment_ref, 'student_id', OLD.student_id), now());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_payment_changes_trigger ON payments;
CREATE TRIGGER audit_payment_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION fn_audit_payment_changes();

-- 9) Constraints: prevent negative amounts
ALTER TABLE payments ADD CONSTRAINT chk_payments_amount_nonnegative CHECK (amount >= 0);

-- 10) Warnings
-- Review the SECURITY DEFINER functions' owners. Ensure they run with a minimal-privilege role and do not allow privilege escalation.
-- Create the private storage bucket 'payment-proofs' in Supabase Storage and restrict public access. Use signed URLs for admin access.
