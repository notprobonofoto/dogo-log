-- Update profiles INSERT policy to allow inserting with user_id
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Update profiles SELECT policy to use household_id from profiles table
DROP POLICY IF EXISTS "Users can view profiles in their household" ON public.profiles;
CREATE POLICY "Users can view profiles in their household" 
  ON public.profiles 
  FOR SELECT 
  USING (
    household_id IN (
      SELECT p.household_id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );