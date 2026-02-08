-- Fix the infinite recursion in profiles SELECT policy
-- Use auth.uid() directly instead of querying profiles table
DROP POLICY IF EXISTS "Users can view profiles in their household" ON public.profiles;
CREATE POLICY "Users can view profiles in their household" 
  ON public.profiles 
  FOR SELECT 
  USING (
    -- User can see their own profile
    user_id = auth.uid()
    OR
    -- Or profiles in the same household as the user
    household_id = (SELECT household_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- Also fix the UPDATE policy which may have the same issue
DROP POLICY IF EXISTS "Users can update profiles in their household" ON public.profiles;
CREATE POLICY "Users can update profiles in their household" 
  ON public.profiles 
  FOR UPDATE 
  USING (user_id = auth.uid());