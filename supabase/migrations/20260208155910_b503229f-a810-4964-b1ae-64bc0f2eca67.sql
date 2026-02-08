-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Households table - stores unique household codes
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table - users linked to households
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dogs table
CREATE TABLE public.dogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  sex VARCHAR(10) NOT NULL CHECK (sex IN ('male', 'female')),
  breed VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dog photos table
CREATE TABLE public.dog_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE NOT NULL,
  data_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Walks table
CREATE TABLE public.walks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 15,
  business VARCHAR(10) NOT NULL DEFAULT 'none' CHECK (business IN ('pee', 'poop', 'both', 'none')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Walk dogs junction table
CREATE TABLE public.walk_dogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  walk_id UUID REFERENCES public.walks(id) ON DELETE CASCADE NOT NULL,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(walk_id, dog_id)
);

-- Meals table
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'dry' CHECK (type IN ('dry', 'wet', 'mixed', 'treat', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Health events table
CREATE TABLE public.health_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('weterynarz', 'groomer', 'szczepienie', 'cieczka_start', 'cieczka_koniec', 'waga', 'inne')),
  note TEXT,
  next_visit DATE,
  weight DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Home accidents table
CREATE TABLE public.home_accidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('pee', 'poop')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table for inter-user communication
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  from_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('walk', 'feed', 'other')),
  scheduled_time TIME,
  note TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dog_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walk_dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_accidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user's household_id
CREATE OR REPLACE FUNCTION public.get_user_household_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Security definer function to check if household code exists
CREATE OR REPLACE FUNCTION public.household_code_exists(code_to_check VARCHAR(6))
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.households WHERE code = code_to_check)
$$;

-- Function to get household_id by code
CREATE OR REPLACE FUNCTION public.get_household_id_by_code(code_to_check VARCHAR(6))
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.households WHERE code = code_to_check LIMIT 1
$$;

-- Function to generate unique 6-digit code
CREATE OR REPLACE FUNCTION public.generate_unique_household_code()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code VARCHAR(6);
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.households WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- RLS Policies for households
CREATE POLICY "Anyone can check if household exists" ON public.households
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create households" ON public.households
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their household" ON public.profiles
  FOR SELECT USING (household_id = public.get_user_household_id() OR user_id IS NULL);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for dogs
CREATE POLICY "Users can view dogs in their household" ON public.dogs
  FOR SELECT USING (household_id = public.get_user_household_id());

CREATE POLICY "Users can insert dogs in their household" ON public.dogs
  FOR INSERT TO authenticated WITH CHECK (household_id = public.get_user_household_id());

CREATE POLICY "Users can update dogs in their household" ON public.dogs
  FOR UPDATE TO authenticated USING (household_id = public.get_user_household_id());

CREATE POLICY "Users can delete dogs in their household" ON public.dogs
  FOR DELETE TO authenticated USING (household_id = public.get_user_household_id());

-- RLS Policies for dog_photos
CREATE POLICY "Users can view photos of dogs in their household" ON public.dog_photos
  FOR SELECT USING (
    dog_id IN (SELECT id FROM public.dogs WHERE household_id = public.get_user_household_id())
  );

CREATE POLICY "Users can insert photos for dogs in their household" ON public.dog_photos
  FOR INSERT TO authenticated WITH CHECK (
    dog_id IN (SELECT id FROM public.dogs WHERE household_id = public.get_user_household_id())
  );

CREATE POLICY "Users can delete photos of dogs in their household" ON public.dog_photos
  FOR DELETE TO authenticated USING (
    dog_id IN (SELECT id FROM public.dogs WHERE household_id = public.get_user_household_id())
  );

-- RLS Policies for walks
CREATE POLICY "Users can view walks in their household" ON public.walks
  FOR SELECT USING (household_id = public.get_user_household_id());

CREATE POLICY "Users can insert walks in their household" ON public.walks
  FOR INSERT TO authenticated WITH CHECK (household_id = public.get_user_household_id());

CREATE POLICY "Users can delete walks in their household" ON public.walks
  FOR DELETE TO authenticated USING (household_id = public.get_user_household_id());

-- RLS Policies for walk_dogs
CREATE POLICY "Users can view walk_dogs in their household" ON public.walk_dogs
  FOR SELECT USING (
    walk_id IN (SELECT id FROM public.walks WHERE household_id = public.get_user_household_id())
  );

CREATE POLICY "Users can insert walk_dogs in their household" ON public.walk_dogs
  FOR INSERT TO authenticated WITH CHECK (
    walk_id IN (SELECT id FROM public.walks WHERE household_id = public.get_user_household_id())
  );

CREATE POLICY "Users can delete walk_dogs in their household" ON public.walk_dogs
  FOR DELETE TO authenticated USING (
    walk_id IN (SELECT id FROM public.walks WHERE household_id = public.get_user_household_id())
  );

-- RLS Policies for meals
CREATE POLICY "Users can view meals in their household" ON public.meals
  FOR SELECT USING (household_id = public.get_user_household_id());

CREATE POLICY "Users can insert meals in their household" ON public.meals
  FOR INSERT TO authenticated WITH CHECK (household_id = public.get_user_household_id());

CREATE POLICY "Users can delete meals in their household" ON public.meals
  FOR DELETE TO authenticated USING (household_id = public.get_user_household_id());

-- RLS Policies for health_events
CREATE POLICY "Users can view health events in their household" ON public.health_events
  FOR SELECT USING (household_id = public.get_user_household_id());

CREATE POLICY "Users can insert health events in their household" ON public.health_events
  FOR INSERT TO authenticated WITH CHECK (household_id = public.get_user_household_id());

CREATE POLICY "Users can delete health events in their household" ON public.health_events
  FOR DELETE TO authenticated USING (household_id = public.get_user_household_id());

-- RLS Policies for home_accidents
CREATE POLICY "Users can view home accidents in their household" ON public.home_accidents
  FOR SELECT USING (household_id = public.get_user_household_id());

CREATE POLICY "Users can insert home accidents in their household" ON public.home_accidents
  FOR INSERT TO authenticated WITH CHECK (household_id = public.get_user_household_id());

CREATE POLICY "Users can delete home accidents in their household" ON public.home_accidents
  FOR DELETE TO authenticated USING (household_id = public.get_user_household_id());

-- RLS Policies for notifications
CREATE POLICY "Users can view notifications in their household" ON public.notifications
  FOR SELECT USING (household_id = public.get_user_household_id());

CREATE POLICY "Users can insert notifications in their household" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (household_id = public.get_user_household_id());

CREATE POLICY "Users can update notifications addressed to them" ON public.notifications
  FOR UPDATE TO authenticated USING (
    to_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their sent notifications" ON public.notifications
  FOR DELETE TO authenticated USING (
    from_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger for updating profiles updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();