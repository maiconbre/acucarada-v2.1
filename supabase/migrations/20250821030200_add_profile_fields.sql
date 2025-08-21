-- Add missing fields to profiles table for Settings component

-- Add username field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add full_name field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add avatar_url field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create unique index on username (excluding null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
ON public.profiles (username) 
WHERE username IS NOT NULL;

-- Update existing profiles to have a default username based on email
UPDATE public.profiles 
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.username IS 'Unique username for the user';
COMMENT ON COLUMN public.profiles.full_name IS 'Full display name of the user';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';