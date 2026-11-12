-- ONE MORE TRY! - Database Schema
-- Supabase PostgreSQL Migration

-- 1. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  avatar_seed TEXT,
  total_games INTEGER DEFAULT 0,
  best_classic INTEGER DEFAULT 0,
  best_endless INTEGER DEFAULT 0,
  best_daily INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GAME SESSIONS TABLE (For Anti-Cheat & Historical Log)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT REFERENCES public.players(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  max_streak INTEGER NOT NULL,
  duration_seconds NUMERIC(6,2) NOT NULL,
  seed BIGINT,
  is_validated BOOLEAN DEFAULT false,
  anti_cheat_status TEXT DEFAULT 'ok',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LEADERBOARDS TABLE
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT REFERENCES public.players(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  mode TEXT NOT NULL, -- 'classic', 'endless', 'daily'
  score INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  max_streak INTEGER NOT NULL,
  period TEXT NOT NULL, -- 'all_time', 'daily', 'weekly'
  period_key TEXT NOT NULL, -- e.g. 'global', '2026-11-12', '2026-W46'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHALLENGES TABLE (Viral Sharing Links)
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  challenger_id TEXT NOT NULL,
  challenger_name TEXT NOT NULL,
  challenger_score INTEGER NOT NULL,
  challenger_streak INTEGER NOT NULL,
  challenger_accuracy NUMERIC(5,2) NOT NULL,
  mode TEXT NOT NULL,
  seed BIGINT NOT NULL,
  plays_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  player_id TEXT,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for Ultra-Fast Queries
CREATE INDEX IF NOT EXISTS idx_leaderboards_lookup 
  ON public.leaderboards(mode, period, period_key, score DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_player 
  ON public.game_sessions(player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_name 
  ON public.analytics_events(event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_challenges_id 
  ON public.challenges(id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow Public Reads on Leaderboards & Challenges
CREATE POLICY "Public can view leaderboards" 
  ON public.leaderboards FOR SELECT USING (true);

CREATE POLICY "Public can view challenges" 
  ON public.challenges FOR SELECT USING (true);

-- Allow Inserts via Server Functions or Anon
CREATE POLICY "Service and Anon can insert game sessions" 
  ON public.game_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Service and Anon can insert players" 
  ON public.players FOR ALL USING (true);

CREATE POLICY "Service and Anon can insert leaderboards" 
  ON public.leaderboards FOR INSERT WITH CHECK (true);

CREATE POLICY "Service and Anon can insert challenges" 
  ON public.challenges FOR ALL USING (true);

CREATE POLICY "Service and Anon can insert analytics" 
  ON public.analytics_events FOR INSERT WITH CHECK (true);
