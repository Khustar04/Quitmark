-- Migration: Create habit reminders, push subscriptions, and reminder execution log
-- Enables per-habit scheduled notifications via Web Push

-- =============================================================================
-- 1. habit_reminders — per-habit reminder configuration
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.habit_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    reminder_time TIME NOT NULL,
    repeat_type TEXT NOT NULL DEFAULT 'DAILY'
        CHECK (repeat_type IN ('DAILY', 'SELECTED_DAYS')),
    repeat_days INT[] DEFAULT NULL
        CHECK (
            repeat_days IS NULL
            OR (
                array_length(repeat_days, 1) > 0
                AND repeat_days <@ ARRAY[0,1,2,3,4,5,6]
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- One reminder per habit
    CONSTRAINT unique_habit_reminder UNIQUE (habit_id)
);

-- Scheduler query: find enabled reminders efficiently
CREATE INDEX IF NOT EXISTS idx_habit_reminders_enabled_time
    ON public.habit_reminders (enabled, reminder_time)
    WHERE enabled = true;

-- User lookup
CREATE INDEX IF NOT EXISTS idx_habit_reminders_user_id
    ON public.habit_reminders (user_id);

-- RLS
ALTER TABLE public.habit_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reminders" ON public.habit_reminders;
CREATE POLICY "Users can view their own reminders"
    ON public.habit_reminders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create reminders for their own habits" ON public.habit_reminders;
CREATE POLICY "Users can create reminders for their own habits"
    ON public.habit_reminders FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.habits
            WHERE habits.id = habit_reminders.habit_id
              AND habits.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own reminders" ON public.habit_reminders;
CREATE POLICY "Users can update their own reminders"
    ON public.habit_reminders FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.habit_reminders;
CREATE POLICY "Users can delete their own reminders"
    ON public.habit_reminders FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================================================
-- 2. push_subscriptions — Web Push endpoints per user/device
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Same browser/device = same endpoint
    CONSTRAINT unique_push_endpoint UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
    ON public.push_subscriptions (user_id);

-- RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view their own push subscriptions"
    ON public.push_subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can create their own push subscriptions"
    ON public.push_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions"
    ON public.push_subscriptions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete their own push subscriptions"
    ON public.push_subscriptions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================================================
-- 3. reminder_executions — idempotency log to prevent duplicate notifications
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reminder_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID NOT NULL REFERENCES public.habit_reminders(id) ON DELETE CASCADE,
    occurrence_key TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Prevents duplicate notifications for the same scheduled occurrence
    CONSTRAINT unique_reminder_occurrence UNIQUE (occurrence_key)
);

CREATE INDEX IF NOT EXISTS idx_reminder_executions_reminder_id
    ON public.reminder_executions (reminder_id);

-- No RLS on reminder_executions — only accessed by the Edge Function via service_role key.
-- RLS is enabled but no policies are created for authenticated users, ensuring
-- frontend clients cannot read or write execution logs.
ALTER TABLE public.reminder_executions ENABLE ROW LEVEL SECURITY;
