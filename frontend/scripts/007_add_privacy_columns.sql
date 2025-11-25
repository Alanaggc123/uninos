-- Add privacy columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS filtro_madrinha boolean DEFAULT false;

-- Update the trigger function to include gender
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, gender, avatar_url, bio, interests, materias_concluidas, is_private, filtro_madrinha)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'gender', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'bio', ''),
    COALESCE((new.raw_user_meta_data->>'interests')::text[], '{}'),
    '{}',
    false,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;
