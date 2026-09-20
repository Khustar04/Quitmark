-- Migration: 20260920100000_smart_reminder_executions.sql
-- Upgrades reminder_executions table to support automatic multi-stage smart reminders
-- (INITIAL, FOLLOW_UP, STREAK_PROTECTION) with clean idempotency logging.
-- Fully backward-safe: existing rows and unique constraints are preserved.

-- 1. Add new columns to reminder_executions if they do not exist
ALTER TABLE public.reminder_executions
    ADD COLUMN IF NOT EXISTS habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS reminder_type TEXT DEFAULT 'INITIAL',
    ADD COLUMN IF NOT EXISTS execution_date DATE,
    ADD COLUMN IF NOT EXISTS scheduled_time TIME,
    ADD COLUMN IF NOT EXISTS sent_status TEXT NOT NULL DEFAULT 'sent';

-- 2. Add performance indexes for efficient daily lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_reminder_executions_habit_date
    ON public.reminder_executions (habit_id, execution_date);

CREATE INDEX IF NOT EXISTS idx_reminder_executions_user_date
    ON public.reminder_executions (user_id, execution_date);

-- 3. Document the schema change
COMMENT ON TABLE public.reminder_executions IS
    'Idempotency log tracking sent smart habit reminders (INITIAL, FOLLOW_UP, STREAK_PROTECTION) to prevent duplicate notifications.';
