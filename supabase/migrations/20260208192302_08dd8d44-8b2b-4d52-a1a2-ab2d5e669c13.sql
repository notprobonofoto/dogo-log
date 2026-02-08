-- Drop the existing policy that has the bug
DROP POLICY IF EXISTS "Users can delete profiles in their household" ON public.profiles;

-- Create a new, simpler policy that allows deleting profiles in the same household
-- The frontend already prevents users from deleting themselves (profileId === memberId check)
-- This policy simply ensures users can only delete profiles within their household
CREATE POLICY "Users can delete profiles in their household" 
ON public.profiles 
FOR DELETE 
USING (household_id = get_my_household_id());