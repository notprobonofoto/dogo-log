-- Update get_user_household_id to use the new get_my_household_id function
CREATE OR REPLACE FUNCTION public.get_user_household_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.get_my_household_id()
$$;