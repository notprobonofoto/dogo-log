-- Create a security definer function to get user's household_id without recursion
CREATE OR REPLACE FUNCTION public.get_my_household_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT household_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Now update the profiles SELECT policy to use this function
DROP POLICY IF EXISTS "Users can view profiles in their household" ON public.profiles;
CREATE POLICY "Users can view profiles in their household" 
  ON public.profiles 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR household_id = get_my_household_id()
  );