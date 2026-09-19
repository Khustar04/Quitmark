-- A check-in can only be created or changed during the user's local calendar day.
-- This prevents direct API callers from backfilling missed dates.

CREATE OR REPLACE FUNCTION public.enforce_habit_checkin_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
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

  IF NEW.check_in_date <> local_today THEN
    RAISE EXCEPTION 'Check-ins can only be recorded for today.' USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_habit_checkin_date ON public.habit_checkins;
CREATE TRIGGER enforce_habit_checkin_date
  BEFORE INSERT OR UPDATE
  ON public.habit_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_habit_checkin_date();

REVOKE EXECUTE ON FUNCTION public.enforce_habit_checkin_date() FROM PUBLIC, anon, authenticated;
