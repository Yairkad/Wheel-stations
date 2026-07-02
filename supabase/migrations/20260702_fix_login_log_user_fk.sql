-- login_log.user_id references users(id) without ON DELETE CASCADE/SET NULL
-- (table predates migration tracking, created directly in Supabase).
-- This blocks DELETE /api/admin/users/[userId] with a foreign key violation
-- for any user who has ever logged in. Since login_log already stores
-- full_name/phone independently, orphaned rows should just null out user_id.
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'login_log'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE login_log DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE login_log
    ADD CONSTRAINT login_log_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
END $$;
