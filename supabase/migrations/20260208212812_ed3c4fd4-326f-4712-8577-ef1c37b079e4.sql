-- 1. Create meal_dogs junction table (for multi-dog meals)
CREATE TABLE public.meal_dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  UNIQUE(meal_id, dog_id)
);

-- Enable RLS
ALTER TABLE public.meal_dogs ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_dogs
CREATE POLICY "Users can view meal_dogs in their household"
ON public.meal_dogs FOR SELECT
USING (
  meal_id IN (SELECT id FROM public.meals WHERE household_id = get_user_household_id())
);

CREATE POLICY "Users can insert meal_dogs in their household"
ON public.meal_dogs FOR INSERT
WITH CHECK (
  meal_id IN (SELECT id FROM public.meals WHERE household_id = get_user_household_id())
);

CREATE POLICY "Users can delete meal_dogs in their household"
ON public.meal_dogs FOR DELETE
USING (
  meal_id IN (SELECT id FROM public.meals WHERE household_id = get_user_household_id())
);

-- 2. Make dog_id nullable in meals table (for backwards compatibility)
ALTER TABLE public.meals ALTER COLUMN dog_id DROP NOT NULL;

-- 3. Create push_subscriptions table for Web Push notifications
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for push_subscriptions
CREATE POLICY "Users can view their own push subscriptions"
ON public.push_subscriptions FOR SELECT
USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their own push subscriptions"
ON public.push_subscriptions FOR INSERT
WITH CHECK (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own push subscriptions"
ON public.push_subscriptions FOR DELETE
USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Also allow reading subscriptions for other household members (needed for sending push to them)
CREATE POLICY "Users can view push subscriptions in their household"
ON public.push_subscriptions FOR SELECT
USING (
  profile_id IN (SELECT id FROM public.profiles WHERE household_id = get_user_household_id())
);