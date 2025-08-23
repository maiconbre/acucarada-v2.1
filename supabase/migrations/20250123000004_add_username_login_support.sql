-- Add support for login with username or email
-- This migration creates a function to get user email by username

-- Function to get email by username for authentication
CREATE OR REPLACE FUNCTION get_email_by_username(input_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Try to find email by username
  SELECT email INTO user_email
  FROM profiles
  WHERE username = input_username
  LIMIT 1;
  
  -- Return the email if found, otherwise return the input (assuming it's an email)
  RETURN COALESCE(user_email, input_username);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION get_email_by_username(TEXT) IS 'Returns email address for a given username, or returns the input if username not found (assuming input is email)';