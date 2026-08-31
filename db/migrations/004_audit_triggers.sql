-- 004_audit_triggers.sql

CREATE OR REPLACE FUNCTION fn_audit_changes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO audit_logs(entity, entity_id, action, changed_by, payload, created_at)
  VALUES (TG_TABLE_NAME::text, NEW.id::uuid, TG_OP::text, current_setting('request.jwt.claims.email', true), row_to_json(NEW), now());
  RETURN NEW;
END;
$$;

-- Example trigger (commented out by default)
-- CREATE TRIGGER audit_courses AFTER INSERT OR UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION fn_audit_changes();
