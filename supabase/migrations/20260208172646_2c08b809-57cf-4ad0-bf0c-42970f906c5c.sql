-- Add note column to walks for poop notes
ALTER TABLE public.walks ADD COLUMN IF NOT EXISTS note TEXT;

-- Add note column to meals for "other" meal descriptions
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS note TEXT;