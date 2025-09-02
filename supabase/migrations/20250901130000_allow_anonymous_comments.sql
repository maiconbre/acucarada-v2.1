-- Drop the foreign key constraint first
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Drop the existing insert policy that requires authentication
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;

-- Drop the user_id column as it is no longer mandatory
ALTER TABLE public.comments DROP COLUMN IF EXISTS user_id;

-- Add a new column to store the author's name for anonymous comments
ALTER TABLE public.comments ADD COLUMN author_name TEXT;

-- Create a new policy to allow anyone to insert comments
CREATE POLICY "Anyone can insert comments"
ON public.comments
FOR INSERT
WITH CHECK (true);
