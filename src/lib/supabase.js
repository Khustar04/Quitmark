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
            let response = await fetch(url, options);
            const urlStr = typeof url === 'string' ? url : url?.url || '';
            const isAuthEndpoint = urlStr.includes('/auth/v1/');

            if (response.status === 401 && !isAuthEndpoint) {
              try {
                const clone = response.clone();
                const bodyText = await clone.text();
                const hasClockSkewBody =
                  bodyText.includes('future') || bodyText.includes('PGRST303');

                if (hasClockSkewBody) {
                  const serverDateHeader = response.headers.get('date');
                  const serverTimeMs = serverDateHeader ? new Date(serverDateHeader).getTime() : 0;
                  const driftMs = serverTimeMs ? Date.now() - serverTimeMs : 0;

                  // If measured drift is large (≥5s), dispatch the UI banner event
                  if (driftMs > 5000 && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                    window.dispatchEvent(
                      new CustomEvent('quitmark:clock-skew', {
                        detail: {
                          driftMs,
                          driftSeconds: Math.round(driftMs / 1000),
                          serverDate: serverDateHeader,
                          message: bodyText,
                        },
                      })
                    );
                  }

                  // Transparent retry: wait 1200ms for PostgREST server clock to catch up with JWT iat
                  await new Promise((res) => setTimeout(res, 1200));

                  // Retry the request with the latest session token if available
                  let retryOptions = options;
                  try {
                    const sessionData = await supabase?.auth?.getSession();
                    const currentToken = sessionData?.data?.session?.access_token;
                    if (currentToken && options?.headers) {
                      const newHeaders = new Headers(options.headers);
                      newHeaders.set('Authorization', `Bearer ${currentToken}`);
                      retryOptions = { ...options, headers: newHeaders };
                    }
                  } catch {
                    // Use original options
                  }

                  response = await fetch(url, retryOptions);

                  // If still 401 with future/PGRST303, try refreshing the token once
                  if (response.status === 401) {
                    const retryClone = response.clone();
                    const retryBody = await retryClone.text();
                    if (retryBody.includes('future') || retryBody.includes('PGRST303')) {
                      try {
                        const refRes = supabase ? await supabase.auth.refreshSession() : null;
                        const refData = refRes?.data;
                        if (refData?.session?.access_token && options?.headers) {
                          const newHeaders = new Headers(options.headers);
                          newHeaders.set('Authorization', `Bearer ${refData.session.access_token}`);
                          response = await fetch(url, { ...options, headers: newHeaders });
                        }
                      } catch {
                        // Return current response
                      }
                    }
                  }
                }
              } catch {
                // If inspection fails, return original response
              }
            }
            return response;
          },
        },
      })
    : null;

export default supabase;
