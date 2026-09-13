-- Migration: Create habits and habit_checkins tables with strict RLS policies
-- Safe and idempotent execution

-- 1. Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create habit_checkins table
CREATE TABLE IF NOT EXISTS public.habit_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'missed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_habit_daily_checkin UNIQUE (habit_id, check_in_date)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_habit_date ON public.habit_checkins(habit_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_user_date ON public.habit_checkins(user_id, check_in_date);

-- Enable Row Level Security
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_checkins ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for habits (Idempotent)
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
CREATE POLICY "Users can view their own habits"
    ON public.habits FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own habits" ON public.habits;
CREATE POLICY "Users can create their own habits"
    ON public.habits FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
CREATE POLICY "Users can update their own habits"
    ON public.habits FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;
CREATE POLICY "Users can delete their own habits"
    ON public.habits FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. RLS Policies for habit_checkins (Strict user_id AND parent habit ownership verification)
DROP POLICY IF EXISTS "Users can view their own checkins" ON public.habit_checkins;
CREATE POLICY "Users can view their own checkins"
    ON public.habit_checkins FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE habits.id = habit_checkins.habit_id
              AND habits.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own checkins" ON public.habit_checkins;
CREATE POLICY "Users can insert their own checkins"
    ON public.habit_checkins FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE habits.id = habit_checkins.habit_id
              AND habits.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own checkins" ON public.habit_checkins;
CREATE POLICY "Users can update their own checkins"
    ON public.habit_checkins FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE habits.id = habit_checkins.habit_id
              AND habits.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE habits.id = habit_checkins.habit_id
              AND habits.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own checkins" ON public.habit_checkins;
CREATE POLICY "Users can delete their own checkins"
    ON public.habit_checkins FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE habits.id = habit_checkins.habit_id
              AND habits.user_id = auth.uid()
        )
    );
