-- ====================================================================
-- SUPABASE MIGRATION SCHEMA: Escape Room & Quiz Sprint Race Dunia Belajar Anak
-- ====================================================================

-- 1. Tabel Ruangan & Gembok Escape Room
CREATE TABLE IF NOT EXISTS public.rooms_content (
    key TEXT PRIMARY KEY DEFAULT 'default',
    list JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Bank Soal Balap (Quiz Sprint Race)
CREATE TABLE IF NOT EXISTS public.race_questions (
    id TEXT PRIMARY KEY,
    story TEXT,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Sesi Kelas Multiplayer Real-Time
CREATE TABLE IF NOT EXISTS public.class_sessions (
    pin TEXT PRIMARY KEY,
    mode TEXT NOT NULL DEFAULT 'quiz_race',
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting', -- waiting, starting, in_progress, finished, closed
    race_questions JSONB,
    countdown_start BIGINT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Pemain / Mahasiswa yang Terhubung ke Sesi
CREATE TABLE IF NOT EXISTS public.session_players (
    id TEXT PRIMARY KEY, -- pin_uid
    session_pin TEXT NOT NULL REFERENCES public.class_sessions(pin) ON DELETE CASCADE,
    uid TEXT NOT NULL,
    name TEXT NOT NULL,
    nim TEXT NOT NULL,
    character_type TEXT DEFAULT 'kart',
    character_color TEXT DEFAULT 'blue',
    score INT DEFAULT 0,
    solved_count INT DEFAULT 0,
    progress_idx INT DEFAULT 0,
    total_questions INT DEFAULT 5,
    is_finished BOOLEAN DEFAULT FALSE,
    finish_rank INT DEFAULT 99,
    last_seen BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk mempercepat query pemain per sesi
CREATE INDEX IF NOT EXISTS idx_session_players_pin ON public.session_players(session_pin);

-- 5. Tabel Rekap Hasil & Nilai Akhir Mahasiswa
CREATE TABLE IF NOT EXISTS public.student_results (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nim TEXT NOT NULL,
    score INT NOT NULL,
    total_correct INT NOT NULL,
    total_questions INT NOT NULL,
    session_mode TEXT DEFAULT 'quiz_race',
    session_pin TEXT,
    answers_record JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Pengaturan Aplikasi & PIN Dosen
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Aktifkan RLS dengan kebijakan publik terbuka untuk kenyamanan interaksi kelas
-- ====================================================================

ALTER TABLE public.rooms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Buat policy publik terbuka
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access rooms_content" ON public.rooms_content;
    CREATE POLICY "Public access rooms_content" ON public.rooms_content FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access race_questions" ON public.race_questions;
    CREATE POLICY "Public access race_questions" ON public.race_questions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access class_sessions" ON public.class_sessions;
    CREATE POLICY "Public access class_sessions" ON public.class_sessions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access session_players" ON public.session_players;
    CREATE POLICY "Public access session_players" ON public.session_players FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access student_results" ON public.student_results;
    CREATE POLICY "Public access student_results" ON public.student_results FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access app_settings" ON public.app_settings;
    CREATE POLICY "Public access app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ====================================================================
-- REALTIME SUBSCRIPTIONS
-- Daftarkan tabel ke publikasi supabase_realtime agar WebSocket broadcast aktif
-- ====================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.class_sessions;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.session_players;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added
END $$;

