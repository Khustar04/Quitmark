-- Goals are user-owned records. Habit IDs are stored as UUIDs so a goal can
-- reference multiple habits without duplicating habit data.
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
    icon TEXT NOT NULL DEFAULT 'Target',
    category TEXT NOT NULL DEFAULT 'Personal',
    duration_days INTEGER NOT NULL DEFAULT 60 CHECK (duration_days BETWEEN 1 AND 3650),
    start_date DATE NOT NULL,
    target_date DATE,
    habit_ids TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT goals_target_after_start CHECK (target_date IS NULL OR target_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_goals_user_created_at ON public.goals (user_id, created_at DESC);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own goals" ON public.goals;
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
