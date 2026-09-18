-- Trigger functions are not RPC endpoints and must not be executable by API roles.
ALTER FUNCTION public.enforce_habit_checkin_date() SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.enforce_habit_checkin_date() FROM PUBLIC, anon, authenticated;

-- Time-zone synchronization is intentionally available only to signed-in users.
REVOKE EXECUTE ON FUNCTION public.set_my_time_zone(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_my_time_zone(text) TO authenticated;
