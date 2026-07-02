-- The live DB's user_roles_user_id_fkey constraint does not actually have
-- ON DELETE CASCADE, despite 20260405_unified_users.sql defining it that way
-- (confirmed via direct Postgres error when manually deleting a users row:
-- "Unable to delete row as it is currently referenced by a foreign key
-- constraint from the table `user_roles`... Set an on delete behavior on
-- the foreign key relation user_roles_user_id_fkey"). Re-create it with the
-- correct behavior so DELETE FROM users no longer requires deleting
-- user_roles rows manually first.
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
