-- Update the trigger function to handle student fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    gender,
    matricula,
    curso,
    periodo,
    avatar_url,
    bio,
    interests,
    gallery_images,
    materias_concluidas,
    is_private,
    filtro_madrinha,
    is_admin
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'other'),
    COALESCE((NEW.raw_user_meta_data->>'matricula')::integer, NULL),
    COALESCE(NEW.raw_user_meta_data->>'curso', NULL),
    COALESCE((NEW.raw_user_meta_data->>'periodo')::integer, NULL),
    NULL,
    '',
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    false,
    false,
    false
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
