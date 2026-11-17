import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof globalThis !== 'undefined' && globalThis.process?.env?.[key]) {
    return globalThis.process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('SUPABASE_URL') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.SUPABASE_URL : undefined);
const supabasePublishableKey = getEnv('SUPABASE_PUBLISHABLE_KEY') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.SUPABASE_PUBLISHABLE_KEY : undefined);

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    '[Quitmark] Supabase environment variables are missing. Please set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in your .env file.'
  );
}

// Client initialization - safe fallback if env variables are not yet configured
export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        global: {
          fetch: async (url, options) => {
            const response = await fetch(url, options);
            if (response.status === 401) {
              try {
                const clone = response.clone();
                const bodyText = await clone.text();
                const serverDateHeader = response.headers.get('date');
                const serverTimeMs = serverDateHeader ? new Date(serverDateHeader).getTime() : 0;
                const driftMs = serverTimeMs ? Date.now() - serverTimeMs : 0;

                // Only fire clock-skew when the MEASURED drift from the server Date header
                // confirms the local clock is genuinely ahead (≥5s). Body text alone is
                // unreliable: a stale JWT from a previous session produces PGRST303/"future"
                // even when the clock is perfectly synced now.
                const hasClockSkewBody =
                  bodyText.includes('future') ||
                  bodyText.includes('PGRST303');

                const isGenuineClockSkew = hasClockSkewBody && driftMs > 5000;

                if (isGenuineClockSkew && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                  window.dispatchEvent(
                    new CustomEvent('quitmark:clock-skew', {
                      detail: {
                        driftMs,
                        driftSeconds: driftMs ? Math.round(driftMs / 1000) : null,
                        serverDate: serverDateHeader,
                        message: bodyText,
                      },
                    })
                  );
                }
              } catch {
                // If clone/text reading fails, ignore
              }
            }
            return response;
          },
        },
      })
    : null;

export default supabase;
