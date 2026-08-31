-- ========================================================
-- FU-DEVER CLUB DAY 2026: SUPABASE DATABASE SCHEMA
-- Bảng "dreams" (Deploy Ước Mơ) & "duel_sessions" (Buggy AI Arena)
-- ========================================================

-- 1. BẢNG ƯỚC MƠ: dreams
CREATE TABLE IF NOT EXISTS public.dreams (
    id TEXT PRIMARY KEY,
    name TEXT,
    content TEXT NOT NULL,
    tag TEXT NOT NULL DEFAULT 'career',
    mascot_index TEXT DEFAULT '11',
    theme TEXT DEFAULT 'classic',
    lantern_shape TEXT DEFAULT 'hoian_lotus',
    consent BOOLEAN DEFAULT true,
    hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BẢNG ĐẤU TRÍ BUGGY ARENA: duel_sessions
CREATE TABLE IF NOT EXISTS public.duel_sessions (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 5,
    streak_max INTEGER NOT NULL DEFAULT 0,
    tier INTEGER NOT NULL DEFAULT 0,
    tier_label TEXT DEFAULT '',
    reward_code TEXT DEFAULT '',
    reward_code_expires_at BIGINT DEFAULT 0,
    reward_status TEXT DEFAULT 'pending',
    phone TEXT,
    answers JSONB,
    ai_reading TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_sessions ENABLE ROW LEVEL SECURITY;

-- Dreams Policies: Public Read & Insert
CREATE POLICY "Allow public read dreams" ON public.dreams
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert dreams" ON public.dreams
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update dreams" ON public.dreams
    FOR UPDATE USING (true);

CREATE POLICY "Allow admin delete dreams" ON public.dreams
    FOR DELETE USING (true);

-- Duel Sessions Policies: Public Read & Insert, Admin Update
CREATE POLICY "Allow public read duel_sessions" ON public.duel_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert duel_sessions" ON public.duel_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update duel_sessions" ON public.duel_sessions
    FOR UPDATE USING (true);

-- 4. ENABLE SUPABASE REALTIME REPLICATION (Dành cho màn hình Display)
ALTER PUBLICATION supabase_realtime ADD TABLE public.dreams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_sessions;
