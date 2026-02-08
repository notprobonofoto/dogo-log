-- Fix the permissive INSERT policy for households
-- Drop the old policy
DROP POLICY IF EXISTS "Authenticated users can create households" ON public.households;

-- Create a more restrictive policy - only allow creating household with valid code
CREATE POLICY "Authenticated users can create households with unique code" ON public.households
  FOR INSERT TO authenticated 
  WITH CHECK (
    code IS NOT NULL 
    AND LENGTH(code) = 6 
    AND code ~ '^[0-9]{6}$'
  );