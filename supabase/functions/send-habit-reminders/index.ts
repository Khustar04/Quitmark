/**
 * Supabase Edge Function: send-habit-reminders
 *
 * Runs every minute via pg_cron / Supabase Cron.
 * Finds enabled reminders that are due NOW in each user's local timezone,
 * sends Web Push notifications, and logs executions for idempotency.
 */

// @ts-ignore: Deno import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore: Deno import
import webpush from "npm:web-push@3.6.7";

// Declare Deno to satisfy TypeScript in non-Deno environments
declare const Deno: any;

// Web Push implementation for Deno
// Using the web-push compatible library for Deno/Edge
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@quitmark.app";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

/**
 * Converts a base64url string to a Uint8Array.
 */
function base64urlToUint8Array(base64url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Converts a Uint8Array to a base64url string.
 */
function uint8ArrayToBase64url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Creates the unsigned JWT token for VAPID.
 */
function createVapidJwt(audience: string): string {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 60 * 60 * 12, // 12 hours
    sub: VAPID_SUBJECT,
  };

  const encodedHeader = uint8ArrayToBase64url(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const encodedPayload = uint8ArrayToBase64url(
    new TextEncoder().encode(JSON.stringify(payload))
  );

  return `${encodedHeader}.${encodedPayload}`;
}

/**
 * Signs the VAPID JWT with the private key using Web Crypto API.
 */
async function signVapidJwt(unsignedToken: string): Promise<string> {
  const privateKeyBytes = base64urlToUint8Array(VAPID_PRIVATE_KEY);

  // Import the raw private key for ECDSA P-256
  const key = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      d: uint8ArrayToBase64url(privateKeyBytes),
      x: uint8ArrayToBase64url(base64urlToUint8Array(VAPID_PUBLIC_KEY).slice(1, 33)),
      y: uint8ArrayToBase64url(base64urlToUint8Array(VAPID_PUBLIC_KEY).slice(33, 65)),
    },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format expected by Web Push
  const sigArray = new Uint8Array(signature);
  return `${unsignedToken}.${uint8ArrayToBase64url(sigArray)}`;
}

/**
 * Sends a Web Push notification to a single subscription endpoint.
 */
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { TTL: 86400, urgency: "normal" }
    );
    return true;

    

    // 404/410 means subscription is no longer valid — should be cleaned up
  } catch (error: any) {
    const statusCode = error?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      console.log(`[send-habit-reminders] Subscription expired: ${subscription.endpoint.slice(0, 50)}...`);
    }
    console.error("[send-habit-reminders] Push send error:", error);
    return false;
  }
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.error("[send-habit-reminders] Missing VAPID configuration.");
}

Deno.serve(async (req: any) => {
  try {
    // Only accept POST (from cron) or GET (for manual testing)
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

    // 1. Query all enabled reminders with habit names. Profiles are loaded
    // separately because profiles.id and habit_reminders.user_id do not have
    // a direct foreign-key relationship for PostgREST to traverse.
    const { data: reminders, error: queryError } = await supabase
      .from("habit_reminders")
      .select(`
        id,
        user_id,
        habit_id,
        reminder_time,
        repeat_type,
        repeat_days,
        habits!inner ( name )
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
      return new Response(JSON.stringify({ sent: 0, message: "No reminders due" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const userIds = [...new Set(reminders.map((reminder: any) => reminder.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, time_zone")
      .in("id", userIds);

    if (profilesError) {
      console.error("[send-habit-reminders] Profile query error:", profilesError);
    }

    const timeZoneByUserId = new Map(
      (profiles || []).map((profile: any) => [profile.id, profile.time_zone || "UTC"])
    );

    let sentCount = 0;
    let skippedCount = 0;

    for (const reminder of reminders) {
      const timezone = timeZoneByUserId.get(reminder.user_id) || "UTC";
      const habitName = reminder.habits?.name || "your habit";

      // 2. Calculate user's current local time
      let localNow: Date;
      try {
        localNow = new Date(
          new Date().toLocaleString("en-US", { timeZone: timezone as string } as any)
        );
      } catch {
        // Invalid timezone — fallback to UTC
        localNow = new Date(
          new Date().toLocaleString("en-US", { timeZone: "UTC" })
        );
      }

      const localHour = localNow.getHours();
      const localMinute = localNow.getMinutes();
      const localDayOfWeek = localNow.getDay(); // 0=Sun, 6=Sat

      // 3. Parse reminder time
      const [reminderHour, reminderMinute] = reminder.reminder_time
        .split(":")
        .map(Number);

      // Check if current minute matches reminder time
      if (localHour !== reminderHour || localMinute !== reminderMinute) {
        continue;
      }

      // 4. Check repeat type / weekday
      if (reminder.repeat_type === "SELECTED_DAYS") {
        if (
          !reminder.repeat_days ||
          !reminder.repeat_days.includes(localDayOfWeek)
        ) {
          continue;
        }
      }
      // DAILY: always matches any weekday

      // 5. Generate occurrence key for idempotency
      const localDateStr = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, "0")}-${String(localNow.getDate()).padStart(2, "0")}`;
      const occurrenceKey = `${reminder.id}:${localDateStr}:${reminder.reminder_time}`;

      // 6. Attempt to insert execution record (unique constraint prevents duplicates)
      const { error: insertError } = await supabase
        .from("reminder_executions")
        .insert({
          reminder_id: reminder.id,
          occurrence_key: occurrenceKey,
        });

      if (insertError) {
        // Duplicate — already sent
        if (
          insertError.code === "23505" ||
          insertError.message?.includes("unique_reminder_occurrence")
        ) {
          skippedCount++;
          continue;
        }
        console.error(
          "[send-habit-reminders] Execution insert error:",
          insertError
        );
        continue;
      }

      // 7. Fetch user's push subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", reminder.user_id);

      if (subError || !subscriptions || subscriptions.length === 0) {
        // Do not consume the occurrence when this user has no active device.
        await supabase
          .from("reminder_executions")
          .delete()
          .eq("occurrence_key", occurrenceKey);
        continue;
      }

      // 8. Send notification to all user devices
      const payload = {
        title: "🔔 Habit Reminder",
        body: `Time to update your ${habitName} habit.`,
        tag: `reminder-${reminder.habit_id}`,
        url: "/dashboard",
      };

      let delivered = 0;
      for (const sub of subscriptions) {
        const success = await sendWebPush(sub, payload);
        if (success) {
          sentCount++;
          delivered++;
        }
      }

      // Allow the next cron tick to retry if every push provider rejected the
      // delivery. Successful occurrences remain idempotent.
      if (delivered === 0) {
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
