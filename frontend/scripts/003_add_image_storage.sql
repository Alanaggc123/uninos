-- Add image_url column to posts table for storing post images
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Commit the migration
SELECT 'Migration completed: Added image_url to posts table';
