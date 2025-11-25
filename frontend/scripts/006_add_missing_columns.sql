-- Add missing columns for images and interests
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- Drop the old image_url column if it exists and migrate data
ALTER TABLE public.posts DROP COLUMN IF EXISTS image_url;
