-- Create comment_reports table for tracking reported comments
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow users to insert their own comment reports"
  ON public.comment_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to view their own comment reports"
  ON public.comment_reports FOR SELECT
  USING (auth.uid() = user_id);
