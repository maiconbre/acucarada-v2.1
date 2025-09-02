-- Grant permissions to administrators to manage comments

-- 1. Create policy for admins to view all comments (approved and unapproved)
CREATE POLICY "Admins can view all comments"
ON public.comments
FOR SELECT
USING (auth.role() = 'service_role');

-- 2. Create policy for admins to delete any comment
CREATE POLICY "Admins can delete comments"
ON public.comments
FOR DELETE
USING (auth.role() = 'service_role');
