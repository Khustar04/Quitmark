/**
 * Supabase Edge Function: send-habit-reminders
 *
 * Automatic Duolingo-style smart reminder system.
 * Runs every minute via pg_cron / Supabase Cron.
 *
 * Reminder Flow per habit:
 * 1. Initial reminder at habit's scheduled reminder_time (if incomplete).
 * 2. Follow-up reminder 60 minutes later (if still incomplete).
 * 3. Streak protection reminder later in the day (if still incomplete and active streak > 0).
 * 4. Stop reminder cycle immediately if habit is completed.
 *
 * Strictly adheres to idempotency, user timezone conversion, and dead-subscription cleanup.
 */

// @ts-ignore: Deno import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore: Deno import
import webpush from "npm:web-push@3.6.7";

declare const Deno: any;

// ─── Centralized System Rules ───────────────────────────────────────────────
const FOLLOW_UP_DELAY_MINUTES = 60;
const MAX_REMINDERS_PER_HABIT_PER_DAY = 3;
const STREAK_WARNING_ENABLED = true;
const STREAK_PROTECTION_DEFAULT_HOUR = 21; // 9:00 PM local time
const STREAK_PROTECTION_DEFAULT_MINUTE = 0;

const REMINDER_TYPES = {
  INITIAL: "INITIAL",
  FOLLOW_UP: "FOLLOW_UP",
  STREAK_PROTECTION: "STREAK_PROTECTION",
} as const;

// ─── Notification Messages ──────────────────────────────────────────────────
const NOTIFICATION_MESSAGES: Record<string, ((name: string) => { title: string; body: string })[]> = {
  [REMINDER_TYPES.INITIAL]: [
    (name: string) => ({ title: "Quitmark Reminder", body: `Time for your ${name} 🌱` }),
    (name: string) => ({ title: "Quitmark Reminder", body: `Your ${name} time is here 💪` }),
    (name: string) => ({ title: "Quitmark Reminder", body: `Ready to keep your streak going with ${name}? 🔥` }),
  ],
  [REMINDER_TYPES.FOLLOW_UP]: [
    (name: string) => ({ title: "Gentle Reminder", body: `Your ${name} is still waiting for you.` }),
    (name: string) => ({ title: "Gentle Reminder", body: `There's still time to complete ${name} today.` }),
    (name: string) => ({ title: "Gentle Reminder", body: `Don't forget your ${name} today.` }),
  ],
  [REMINDER_TYPES.STREAK_PROTECTION]: [
    (name: string) => ({ title: "🔥 Streak at Risk!", body: `Your streak is at risk 🔥 Complete ${name} before the day ends.` }),
    (name: string) => ({ title: "🔥 Protect Your Streak", body: `Complete ${name} before midnight to keep your streak alive!` }),
    (name: string) => ({ title: "🔥 Streak at Risk!", body: `One more step to protect your ${name} streak.` }),
  ],
};

function getMotivationalMessage(type: string, habitName: string, daySeed: number) {
  const templates = NOTIFICATION_MESSAGES[type] || NOTIFICATION_MESSAGES[REMINDER_TYPES.INITIAL];
  const idx = Math.abs(daySeed) % templates.length;
  return templates[idx](habitName);
}

// ─── Scheduling Helpers ─────────────────────────────────────────────────────
interface ScheduledStage {
  type: string;
  hour: number;
  minute: number;
  timeStr: string;
}

function computeSmartSchedule(reminderTime: string): ScheduledStage[] {
  const [hStr = "07", mStr = "00"] = reminderTime.split(":");
  const initialHour = Math.min(23, Math.max(0, parseInt(hStr, 10) || 0));
  const initialMinute = Math.min(59, Math.max(0, parseInt(mStr, 10) || 0));
  const initialTotalMinutes = initialHour * 60 + initialMinute;

  const stages: ScheduledStage[] = [
    {
      type: REMINDER_TYPES.INITIAL,
      hour: initialHour,
      minute: initialMinute,
      timeStr: `${String(initialHour).padStart(2, "0")}:${String(initialMinute).padStart(2, "0")}`,
    },
  ];

  // 1. Follow-up: initial + FOLLOW_UP_DELAY_MINUTES
  const followUpMinutes = initialTotalMinutes + FOLLOW_UP_DELAY_MINUTES;
  if (followUpMinutes < 24 * 60) {
    const fh = Math.floor(followUpMinutes / 60);
    const fm = followUpMinutes % 60;
    stages.push({
      type: REMINDER_TYPES.FOLLOW_UP,
      hour: fh,
      minute: fm,
      timeStr: `${String(fh).padStart(2, "0")}:${String(fm).padStart(2, "0")}`,
    });
  }

  // 2. Streak protection: later in the day, after follow-up
  if (STREAK_WARNING_ENABLED) {
    const defaultProtectionMinutes =
      STREAK_PROTECTION_DEFAULT_HOUR * 60 + STREAK_PROTECTION_DEFAULT_MINUTE;
    const minAfterFollowUp = followUpMinutes + FOLLOW_UP_DELAY_MINUTES;
    const streakMinutes = Math.max(defaultProtectionMinutes, minAfterFollowUp);

    if (streakMinutes <= 23 * 60 + 30 && streakMinutes > followUpMinutes) {
      const sh = Math.floor(streakMinutes / 60);
      const sm = streakMinutes % 60;
      if (stages.length < MAX_REMINDERS_PER_HABIT_PER_DAY) {
        stages.push({
          type: REMINDER_TYPES.STREAK_PROTECTION,
          hour: sh,
          minute: sm,
          timeStr: `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`,
        });
      }
    }
  }

  return stages;
}

// ─── Environment & Push Credentials ─────────────────────────────────────────
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@quitmark.app";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.error("[send-habit-reminders] Missing VAPID configuration.");
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object
): Promise<{ success: boolean; expired: boolean }> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { TTL: 86400, urgency: "normal" }
    );
    return { success: true, expired: false };
  } catch (error: any) {
    const statusCode = error?.statusCode;
    const isExpired = statusCode === 404 || statusCode === 410;
    if (isExpired) {
      console.log(`[send-habit-reminders] Subscription expired: ${subscription.endpoint.slice(0, 50)}...`);
    } else {
      console.error("[send-habit-reminders] Push send error:", error);
    }
    return { success: false, expired: isExpired };
  }
}

// ─── Edge Function Handler ──────────────────────────────────────────────────
Deno.serve(async (req: any) => {
  try {
    if (req.method !== "POST" && req.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[send-habit-reminders] Missing Supabase environment variables.");
      return new Response("Server configuration error", { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 1. Fetch enabled reminders with active habits
    const { data: reminders, error: queryError } = await supabase
      .from("habit_reminders")
      .select(`
        id,
        user_id,
        habit_id,
        reminder_time,
        repeat_type,
        repeat_days,
        habits!inner ( id, name )
      `)
      .eq("enabled", true);

    if (queryError) {
      console.error("[send-habit-reminders] Query error:", queryError);
      return new Response(JSON.stringify({ error: queryError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No active reminders" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Fetch user timezones
    const userIds = [...new Set(reminders.map((r: any) => r.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, time_zone")
      .in("id", userIds);

    if (profilesError) {
      console.error("[send-habit-reminders] Profile query error:", profilesError);
    }

    const timeZoneByUserId = new Map(
      (profiles || []).map((p: any) => [p.id, p.time_zone || "UTC"])
    );

    let sentCount = 0;
    let skippedCount = 0;

    for (const reminder of reminders) {
      const timezone = timeZoneByUserId.get(reminder.user_id) || "UTC";
      const habitName = reminder.habits?.name || "your habit";

      // 3. User local current time
      let localNow: Date;
      try {
        localNow = new Date(
          new Date().toLocaleString("en-US", { timeZone: timezone as string } as any)
        );
      } catch {
        localNow = new Date(
          new Date().toLocaleString("en-US", { timeZone: "UTC" })
        );
      }

      const localHour = localNow.getHours();
      const localMinute = localNow.getMinutes();
      const localDayOfWeek = localNow.getDay(); // 0=Sun, 6=Sat
      const localDateStr = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, "0")}-${String(localNow.getDate()).padStart(2, "0")}`;

      // 4. Verify scheduled for today (Repeat Type / Days)
      if (reminder.repeat_type === "SELECTED_DAYS") {
        if (!reminder.repeat_days || !reminder.repeat_days.includes(localDayOfWeek)) {
          continue;
        }
      }

      // 5. Smart Schedule: determine if any stage is due NOW
      const schedule = computeSmartSchedule(reminder.reminder_time);
      const dueStage = schedule.find((s) => s.hour === localHour && s.minute === localMinute);

      if (!dueStage) {
        continue;
      }

      // 6. Idempotency Key check: <reminderId>:<localDate>:<stageType>
      const occurrenceKey = `${reminder.id}:${localDateStr}:${dueStage.type}`;

      // Lock occurrence by inserting into reminder_executions
      const { error: insertError } = await supabase
        .from("reminder_executions")
        .insert({
          reminder_id: reminder.id,
          occurrence_key: occurrenceKey,
          habit_id: reminder.habit_id,
          user_id: reminder.user_id,
          reminder_type: dueStage.type,
          execution_date: localDateStr,
          scheduled_time: dueStage.timeStr,
          sent_status: "pending",
        });

      if (insertError) {
        // Unique violation means already scheduled/processed today
        if (
          insertError.code === "23505" ||
          insertError.message?.includes("unique_reminder_occurrence")
        ) {
          skippedCount++;
          continue;
        }
        console.error("[send-habit-reminders] Execution insert error:", insertError);
        continue;
      }

      // 7. HABIT COMPLETION CHECK: Query latest checkin status for today
      const { data: todayCheckin } = await supabase
        .from("habit_checkins")
        .select("status")
        .eq("habit_id", reminder.habit_id)
        .eq("check_in_date", localDateStr)
        .maybeSingle();

      if (todayCheckin?.status === "completed") {
        // Habit completed! Stop reminder cycle immediately.
        await supabase
          .from("reminder_executions")
          .update({ sent_status: "skipped_completed" })
          .eq("occurrence_key", occurrenceKey);
        skippedCount++;
        continue;
      }

      if (todayCheckin?.status === "missed") {
        await supabase
          .from("reminder_executions")
          .update({ sent_status: "skipped_missed" })
          .eq("occurrence_key", occurrenceKey);
        skippedCount++;
        continue;
      }

      // 8. STREAK PROTECTION CHECK: Verify active streak exists
      if (dueStage.type === REMINDER_TYPES.STREAK_PROTECTION) {
        // Find yesterday's date
        const yesterday = new Date(localNow);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

        const { data: yesterdayCheckin } = await supabase
          .from("habit_checkins")
          .select("status")
          .eq("habit_id", reminder.habit_id)
          .eq("check_in_date", yesterdayStr)
          .maybeSingle();

        // If yesterday was not completed, no active streak can be lost today!
        if (yesterdayCheckin?.status !== "completed") {
          await supabase
            .from("reminder_executions")
            .update({ sent_status: "skipped_no_active_streak" })
            .eq("occurrence_key", occurrenceKey);
          skippedCount++;
          continue;
        }
      }

      // 9. Fetch user's push subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", reminder.user_id);

      if (subError || !subscriptions || subscriptions.length === 0) {
        // No active device subscribed for this user: release occurrence lock
        await supabase
          .from("reminder_executions")
          .delete()
          .eq("occurrence_key", occurrenceKey);
        continue;
      }

      // 10. Deliver Motivational Push Notification
      const daySeed = localNow.getDate() + localNow.getMonth();
      const message = getMotivationalMessage(dueStage.type, habitName, daySeed);

      const payload = {
        title: message.title,
        body: message.body,
        tag: `reminder-${reminder.habit_id}-${dueStage.type.toLowerCase()}`,
        url: "/dashboard",
      };

      let delivered = 0;
      const expiredEndpoints: string[] = [];

      for (const sub of subscriptions) {
        const result = await sendWebPush(sub, payload);
        if (result.success) {
          sentCount++;
          delivered++;
        } else if (result.expired) {
          expiredEndpoints.push(sub.endpoint);
        }
      }

      // Clean up dead/expired push subscriptions
      if (expiredEndpoints.length > 0) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .in("endpoint", expiredEndpoints);
      }

      if (delivered > 0) {
        await supabase
          .from("reminder_executions")
          .update({ sent_status: "sent" })
          .eq("occurrence_key", occurrenceKey);
      } else {
        // All push attempts failed (network/provider outage): allow retry
        await supabase
          .from("reminder_executions")
          .delete()
          .eq("occurrence_key", occurrenceKey);
      }
    }

    return new Response(
      JSON.stringify({
        sent: sentCount,
        skipped: skippedCount,
        total_checked: reminders.length,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[send-habit-reminders] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
