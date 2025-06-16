ALTER TABLE public.journal_entries 
DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;

ALTER TABLE public.journal_entries 
ADD CONSTRAINT journal_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.ensure_profile_exists(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  SELECT user_uuid, email
  FROM auth.users
  WHERE id = user_uuid
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
