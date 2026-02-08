-- Add DELETE policy for profiles in the same household
CREATE POLICY "Users can delete profiles in their household" 
ON public.profiles 
FOR DELETE 
USING (
  household_id = get_my_household_id() 
  AND id != (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
);