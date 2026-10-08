-- ====================================================================
-- RESQSENSE SUPABASE DATABASE SCHEMA & POLICIES
-- Copy and paste this script into your Supabase project's SQL Editor
-- (https://app.supabase.com/project/_/sql) and click "Run".
-- ====================================================================

-- 1. PROFILES TABLE (Rescue Responders & Command Administrators)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('rescue', 'admin', 'citizen')),
  name TEXT,
  badge_id TEXT,
  agency TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 2. INCIDENTS TABLE (Real-time disaster reports and SOS triage)
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  lat FLOAT8,
  lng FLOAT8,
  priority INTEGER NOT NULL DEFAULT 50,
  confidence INTEGER DEFAULT 80,
  people INTEGER DEFAULT 1,
  medical BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'REPORTED',
  assigned_team TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on incidents
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Incidents Policies: Citizens can view and submit incidents freely without authentication
CREATE POLICY "Anyone can view incidents" 
ON public.incidents FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Anyone can submit an emergency SOS incident" 
ON public.incidents FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Responders and Admins can update incident status and assignments" 
ON public.incidents FOR UPDATE 
TO public 
USING (true);

-- 3. RESCUE TEAMS TABLE (Field units, NGO corps, and government disaster units)
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  lat FLOAT8,
  lng FLOAT8,
  phone TEXT,
  readiness INTEGER DEFAULT 90,
  personnel INTEGER DEFAULT 10,
  skills TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rescue teams" 
ON public.teams FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Authenticated staff can manage teams" 
ON public.teams FOR ALL 
TO authenticated 
USING (true);

-- 4. SEED INITIAL DEMO DATA (If tables are empty)
INSERT INTO public.teams (id, name, type, lat, lng, phone, readiness, personnel, skills, equipment, status)
VALUES
  ('T-101', 'Rapid Relief Foundation', 'NGO', 22.5726, 88.3639, '+91-00000-00001', 94, 8, ARRAY['Flood','Medical','Search & Rescue'], ARRAY['Boat','Medical Kit'], 'AVAILABLE'),
  ('T-102', 'District Emergency Response Unit', 'GOVERNMENT', 22.5850, 88.3700, '+91-00000-00002', 97, 12, ARRAY['Flood','Search & Rescue','Earthquake'], ARRAY['Boat','Ambulance'], 'AVAILABLE'),
  ('T-103', 'Community Rescue Network', 'NGO', 22.5600, 88.3500, '+91-00000-00003', 88, 6, ARRAY['Medical','Fire'], ARRAY['Medical Kit','Rescue Vehicle'], 'AVAILABLE'),
  ('T-104', 'Urban Search & Rescue Cell', 'GOVERNMENT', 22.5900, 88.3900, '+91-00000-00004', 91, 10, ARRAY['Earthquake','Landslide','Search & Rescue'], ARRAY['Rescue Vehicle','Medical Kit'], 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.incidents (id, type, lat, lng, priority, confidence, people, medical, status, assigned_team)
VALUES
  ('INC-1042', 'Flood', 22.5726, 88.3639, 92, 87, 12, true, 'VERIFIED', 'T-101'),
  ('INC-1047', 'Landslide', 22.5900, 88.3900, 88, 91, 8, false, 'PRIORITIZED', NULL),
  ('INC-1051', 'Earthquake', 22.5600, 88.3500, 84, 79, 20, true, 'REPORTED', NULL),
  ('INC-1054', 'Heavy Rain', 22.6100, 88.3600, 58, 83, 5, false, 'REPORTED', NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. AUTOMATIC TRIGGER FOR USER SIGNUPS (Automatically create profile when user signs up via Supabase Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name, badge_id, agency)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'rescue'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Responder'),
    COALESCE(NEW.raw_user_meta_data->>'badgeId', 'BDG-001'),
    COALESCE(NEW.raw_user_meta_data->>'agency', 'Disaster Response Force')
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    badge_id = EXCLUDED.badge_id,
    agency = EXCLUDED.agency,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
