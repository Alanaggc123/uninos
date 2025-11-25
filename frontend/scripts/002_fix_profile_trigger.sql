-- Drop and recreate the handle_new_user function to properly handle student fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    -- Use NULLIF to convert empty strings to NULL before casting to integer
    CASE 
      WHEN NEW.raw_user_meta_data->>'matricula' IS NOT NULL AND NEW.raw_user_meta_data->>'matricula' != '' 
      THEN (NEW.raw_user_meta_data->>'matricula')::integer
      ELSE NULL
    END,
    NULLIF(NEW.raw_user_meta_data->>'curso', ''),
    -- Use NULLIF to convert empty strings to NULL before casting to integer
    CASE 
      WHEN NEW.raw_user_meta_data->>'periodo' IS NOT NULL AND NEW.raw_user_meta_data->>'periodo' != '' 
      THEN (NEW.raw_user_meta_data->>'periodo')::integer
      ELSE NULL
    END,
    NULL,
    '',
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    COALESCE((NEW.raw_user_meta_data->>'is_private')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'filtro_madrinha')::boolean, false),
    -- Extract is_admin from metadata
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN NEW;
END;
$$;
