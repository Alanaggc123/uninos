-- Fix the handle_new_user trigger to handle duplicate profile inserts
-- This prevents errors when users attempt to sign up multiple times

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert or update the profile for the new user
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    gender,
    matricula,
    curso,
    periodo,
    is_admin,
    is_private,
    filtro_madrinha
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gender', 'other'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'matricula' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'matricula' != '' 
      THEN (NEW.raw_user_meta_data->>'matricula')::integer 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data->>'curso', NULL),
    CASE 
      WHEN NEW.raw_user_meta_data->>'periodo' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'periodo' != '' 
      THEN (NEW.raw_user_meta_data->>'periodo')::integer 
      ELSE NULL 
    END,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'is_private')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'filtro_madrinha')::boolean, false)
  )
  -- Added ON CONFLICT clause to handle duplicate profile inserts
  ON CONFLICT (id) 
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    gender = EXCLUDED.gender,
    matricula = EXCLUDED.matricula,
    curso = EXCLUDED.curso,
    periodo = EXCLUDED.periodo,
    is_admin = EXCLUDED.is_admin,
    is_private = EXCLUDED.is_private,
    filtro_madrinha = EXCLUDED.filtro_madrinha,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is set up correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
