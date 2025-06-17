CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
AS $$
BEGIN
  INSERT INTO public.users (auth_id, username, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'customer'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (email) DO UPDATE
  SET auth_id = EXCLUDED.auth_id;

  RETURN NEW;
END;
$$; 