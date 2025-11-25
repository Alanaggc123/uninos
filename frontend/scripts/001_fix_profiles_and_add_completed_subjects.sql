-- Fix RLS policy for profiles to allow upsert during sign up
-- Add materias_concluidas column to profiles table

-- First, add the new column for completed subjects
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS materias_concluidas TEXT[];

-- Drop and recreate the INSERT policy to be more permissive during sign up
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;

CREATE POLICY "Allow users to insert their own profile"
ON profiles FOR INSERT
WITH CHECK (true);

-- Ensure UPDATE policy allows users to update their own profile
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;

CREATE POLICY "Allow users to update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
