-- Migration: Create profiles table and leaderboard secure RPC

-- 1. Create public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Users can only insert/update their own profile
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Extracts full_name from OAuth, or falls back to email prefix
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'user_' || substr(md5(random()::text), 1, 6)
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow idempotent runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill profiles for any existing users
INSERT INTO public.profiles (id, display_name)
SELECT id, 
    COALESCE(
      raw_user_meta_data->>'full_name',
      raw_user_meta_data->>'name',
      split_part(email, '@', 1),
      'user_' || substr(md5(random()::text), 1, 6)
    )
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name;

-- 4. Secure RPC for calculating leaderboard
-- SECURITY DEFINER ensures the function can read habits and checkins even if RLS normally blocks cross-user reads
-- search_path = public is set to prevent path injection attacks
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count integer DEFAULT 50)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    current_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH today_status AS (
        SELECT habit_id, status
        FROM public.habit_checkins
        WHERE check_in_date = CURRENT_DATE
    ),
    completed_dates AS (
        SELECT
            habit_id,
            check_in_date,
            check_in_date + (ROW_NUMBER() OVER (PARTITION BY habit_id ORDER BY check_in_date DESC))::integer AS grp
        FROM public.habit_checkins
        WHERE status = 'completed'
          AND check_in_date <= CURRENT_DATE
    ),
    anchors AS (
        SELECT DISTINCT ON (habit_id) habit_id, grp
        FROM completed_dates
        WHERE check_in_date >= CURRENT_DATE - 1
        ORDER BY habit_id, check_in_date DESC
    ),
    habit_streaks AS (
        SELECT
            h.user_id,
            count(c.*) AS streak
        FROM anchors a
        JOIN completed_dates c ON a.habit_id = c.habit_id AND a.grp = c.grp
        JOIN public.habits h ON h.id = a.habit_id
        LEFT JOIN today_status ts ON ts.habit_id = a.habit_id
        -- Disqualify the streak if today was explicitly marked 'missed'
        WHERE COALESCE(ts.status, 'pending') != 'missed'
        GROUP BY h.user_id, a.habit_id
    ),
    max_streaks AS (
        SELECT hs.user_id, max(hs.streak) AS best_streak
        FROM habit_streaks hs
        GROUP BY hs.user_id
    )
    SELECT 
        p.id AS user_id, 
        p.display_name, 
        ms.best_streak::integer AS current_streak
    FROM max_streaks ms
    JOIN public.profiles p ON p.id = ms.user_id
    WHERE ms.best_streak > 0
    ORDER BY ms.best_streak DESC, p.created_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke default public access and explicitly grant to authenticated users
REVOKE EXECUTE ON FUNCTION get_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_leaderboard(integer) TO authenticated;
