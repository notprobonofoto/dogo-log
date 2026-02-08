-- Create a function to set the current household for the session
-- This will be called after user enters their household code
CREATE OR REPLACE FUNCTION public.set_session_household(household_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Store household_id in the session's config
  PERFORM set_config('app.current_household_id', household_id_param::text, false);
END;
$$;

-- Create a function to get the current session's household
CREATE OR REPLACE FUNCTION public.get_session_household_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  hid text;
BEGIN
  hid := current_setting('app.current_household_id', true);
  IF hid IS NULL OR hid = '' THEN
    RETURN NULL;
  END IF;
  RETURN hid::uuid;
END;
$$;

-- Update the get_user_household_id function to work with both auth.uid() and session-based approach
CREATE OR REPLACE FUNCTION public.get_user_household_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  hid uuid;
  session_hid text;
BEGIN
  -- First try to get from profiles table (for logged-in users)
  SELECT household_id INTO hid FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  IF hid IS NOT NULL THEN
    RETURN hid;
  END IF;
  
  -- Then try to get from session variable (for anonymous users)
  session_hid := current_setting('app.current_household_id', true);
  IF session_hid IS NOT NULL AND session_hid != '' THEN
    RETURN session_hid::uuid;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Update profiles insert policy to allow anonymous users to create profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  -- Allow if user_id matches auth.uid() OR user_id is null (anonymous)
  (user_id = auth.uid()) OR (user_id IS NULL)
);

-- Update profiles select policy to include anonymous access via household
DROP POLICY IF EXISTS "Users can view profiles in their household" ON public.profiles;
CREATE POLICY "Users can view profiles in their household"
ON public.profiles
FOR SELECT
USING (
  household_id = get_user_household_id() 
  OR user_id IS NULL
);

-- Update profiles update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update profiles in their household"
ON public.profiles
FOR UPDATE
USING (
  household_id = get_user_household_id()
);