-- Update the get_user_household_id function to work properly with anonymous users
-- Now that profiles have user_id set (even for anonymous users), this is simpler
CREATE OR REPLACE FUNCTION public.get_user_household_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  hid uuid;
BEGIN
  -- Get household_id from profiles table using auth.uid()
  -- This works for both regular and anonymous users
  SELECT household_id INTO hid FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  RETURN hid;
END;
$function$;