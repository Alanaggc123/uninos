-- Add interests column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add gallery images column to store multiple image URLs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add images_urls column to posts for multiple images
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add updated_at column to comments for edit tracking
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
