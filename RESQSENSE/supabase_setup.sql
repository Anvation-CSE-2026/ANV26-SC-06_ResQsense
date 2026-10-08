-- ============================================================
-- ResQSense — Supabase Database Setup Script
-- ============================================================
-- Run this in your Supabase project's SQL Editor:
--   https://supabase.com/dashboard → Your Project → SQL Editor
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1. TEAMS TABLE
--    Stores rescue team information and readiness data.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('NGO', 'GOVERNMENT', 'PRIVATE')),
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  phone      TEXT,
  readiness  INTEGER DEFAULT 100 CHECK (readiness BETWEEN 0 AND 100),
  personnel  INTEGER DEFAULT 1,
  skills     TEXT[] DEFAULT '{}',
  equipment  TEXT[] DEFAULT '{}',
  status     TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'DEPLOYED', 'STANDBY', 'OFFLINE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon + authenticated) to read teams
CREATE POLICY "Teams: Public Read"
  ON public.teams FOR SELECT
  USING (true);

-- Only service role (backend) can insert/update/delete teams
CREATE POLICY "Teams: Service Role Write"
  ON public.teams FOR ALL
  USING (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────────────────
-- 2. INCIDENTS TABLE
--    Stores disaster incident reports, their triage scores, and assignments.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.incidents (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  priority      INTEGER DEFAULT 50 CHECK (priority BETWEEN 0 AND 100),
  confidence    INTEGER DEFAULT 70 CHECK (confidence BETWEEN 0 AND 100),
  people        INTEGER DEFAULT 1,
  medical       BOOLEAN DEFAULT FALSE,
  status        TEXT DEFAULT 'REPORTED'
                  CHECK (status IN ('REPORTED', 'PRIORITIZED', 'VERIFIED', 'ASSIGNED', 'RESOLVED')),
  "assignedTeam" TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  "createdAt"   TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read incidents (public safety data)
CREATE POLICY "Incidents: Public Read"
  ON public.incidents FOR SELECT
  USING (true);

-- Allow authenticated rescue/admin users to insert incidents
CREATE POLICY "Incidents: Authenticated Insert"
  ON public.incidents FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- Allow authenticated users or service role to update incidents
CREATE POLICY "Incidents: Authenticated Update"
  ON public.incidents FOR UPDATE
  USING (auth.role() IN ('authenticated', 'service_role'));

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ──────────────────────────────────────────────────────────────
-- 3. USER PROFILES TABLE (optional — stores extra metadata)
--    Supabase Auth handles passwords in auth.users (built-in).
--    This table extends user records with role, badgeId, agency.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('rescue', 'admin')),
  name       TEXT,
  badge_id   TEXT,
  agency     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Profiles: Users Read Own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Profiles: Users Update Own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can manage all profiles
CREATE POLICY "Profiles: Service Role All"
  ON public.user_profiles FOR ALL
  USING (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────────────────
-- 4. SEED DEMO TEAMS
--    Insert initial rescue team data so the app has data on first run.
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.teams (id, name, type, lat, lng, phone, readiness, personnel, skills, equipment, status)
VALUES
  ('T-101', 'Rapid Relief Foundation',        'NGO',        22.5726, 88.3639, '+91-00000-00001', 94, 8,  ARRAY['Flood','Medical','Search & Rescue'],          ARRAY['Boat','Medical Kit'],           'AVAILABLE'),
  ('T-102', 'District Emergency Response Unit','GOVERNMENT', 22.585,  88.37,   '+91-00000-00002', 97, 12, ARRAY['Flood','Search & Rescue','Earthquake'],       ARRAY['Boat','Ambulance'],             'AVAILABLE'),
  ('T-103', 'Community Rescue Network',        'NGO',        22.56,   88.35,   '+91-00000-00003', 88, 6,  ARRAY['Medical','Fire'],                             ARRAY['Medical Kit','Rescue Vehicle'], 'AVAILABLE'),
  ('T-104', 'Urban Search & Rescue Cell',      'GOVERNMENT', 22.59,   88.39,   '+91-00000-00004', 91, 10, ARRAY['Earthquake','Landslide','Search & Rescue'],   ARRAY['Rescue Vehicle','Medical Kit'], 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- 5. SEED DEMO INCIDENTS
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.incidents (id, type, lat, lng, priority, confidence, people, medical, status, "assignedTeam")
VALUES
  ('INC-1042', 'Flood',      22.5726, 88.3639, 92, 87, 12, TRUE,  'VERIFIED',    'T-101'),
  ('INC-1047', 'Landslide',  22.59,   88.39,   88, 91, 8,  FALSE, 'PRIORITIZED', NULL),
  ('INC-1051', 'Earthquake', 22.56,   88.35,   84, 79, 20, TRUE,  'REPORTED',    NULL),
  ('INC-1054', 'Heavy Rain', 22.61,   88.36,   58, 83, 5,  FALSE, 'REPORTED',    NULL)
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- DONE!
-- After running this script, go back to your .env file and fill in:
--   SUPABASE_URL=<your project URL>
--   SUPABASE_ANON_KEY=<your anon public key>
--   SUPABASE_SERVICE_ROLE_KEY=<your service role secret key>
--   VITE_SUPABASE_URL=<same as SUPABASE_URL>
--   VITE_SUPABASE_ANON_KEY=<same as SUPABASE_ANON_KEY>
-- ──────────────────────────────────────────────────────────────
