-- Secure check-in dates and keep database date calculations aligned with each user's local calendar.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS time_zone text NOT NULL DEFAULT 'UTC';

-- Existing profile names are user data. Future backfills must never overwrite them.
INSERT INTO public.profiles (id, display_name)
SELECT
  id,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1),
    'user_' || substr(md5(random()::text), 1, 6)
  )
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Accept only real IANA time zones and update only the calling user's profile.
CREATE OR REPLACE FUNCTION public.set_my_time_zone(requested_time_zone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.';
  END IF;

  IF requested_time_zone IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM pg_timezone_names
       WHERE name = requested_time_zone
     ) THEN
    RAISE EXCEPTION 'Invalid time zone.';
  END IF;

  UPDATE public.profiles
  SET time_zone = requested_time_zone
  WHERE id = auth.uid()
    AND time_zone IS DISTINCT FROM requested_time_zone;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_my_time_zone(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_time_zone(text) TO authenticated;

-- Enforce the date boundary in the database. Historical check-ins remain valid.
CREATE OR REPLACE FUNCTION public.enforce_habit_checkin_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  user_time_zone text;
  local_today date;
BEGIN
  SELECT time_zone
  INTO user_time_zone
  FROM public.profiles
  WHERE id = NEW.user_id;

  local_today := (now() AT TIME ZONE COALESCE(user_time_zone, 'UTC'))::date;

  IF NEW.check_in_date > local_today THEN
    RAISE EXCEPTION 'Check-in date cannot be in the future.' USING ERRCODE = '22007';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_habit_checkin_date ON public.habit_checkins;
CREATE TRIGGER enforce_habit_checkin_date
  BEFORE INSERT OR UPDATE OF check_in_date, user_id
  ON public.habit_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_habit_checkin_date();

-- Use the same per-user local date for streak calculations and bound callers to 1..100 rows.
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count integer DEFAULT 50)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  current_streak integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  effective_limit integer := LEAST(GREATEST(COALESCE(limit_count, 50), 1), 100);
BEGIN
  RETURN QUERY
  WITH habit_context AS (
    SELECT
      h.id AS habit_id,
      h.user_id,
      (now() AT TIME ZONE COALESCE(p.time_zone, 'UTC'))::date AS local_today
    FROM public.habits h
    JOIN public.profiles p ON p.id = h.user_id
  ),
  today_status AS (
    SELECT hc.habit_id, c.status
    FROM habit_context hc
    JOIN public.habit_checkins c
      ON c.habit_id = hc.habit_id
     AND c.check_in_date = hc.local_today
  ),
  completed_dates AS (
    SELECT
      hc.habit_id,
      hc.user_id,
      hc.local_today,
      c.check_in_date,
      c.check_in_date
        + (ROW_NUMBER() OVER (PARTITION BY hc.habit_id ORDER BY c.check_in_date DESC))::integer AS grp
    FROM habit_context hc
    JOIN public.habit_checkins c ON c.habit_id = hc.habit_id
    WHERE c.status = 'completed'
      AND c.check_in_date <= hc.local_today
  ),
  anchors AS (
    SELECT DISTINCT ON (habit_id) habit_id, grp
    FROM completed_dates
    WHERE check_in_date >= local_today - 1
    ORDER BY habit_id, check_in_date DESC
  ),
  habit_streaks AS (
    SELECT cd.user_id, cd.habit_id, count(*) AS streak
    FROM anchors a
    JOIN completed_dates cd
      ON cd.habit_id = a.habit_id
     AND cd.grp = a.grp
    LEFT JOIN today_status ts ON ts.habit_id = a.habit_id
    WHERE COALESCE(ts.status, 'pending') <> 'missed'
    GROUP BY cd.user_id, cd.habit_id
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
  LIMIT effective_limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;
