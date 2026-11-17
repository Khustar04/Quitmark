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
              const authHeader = response.headers.get('www-authenticate') || '';
              if (authHeader.toLowerCase().includes('future')) {
                if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                  window.dispatchEvent(new CustomEvent('quitmark:clock-skew'));
                }
              }
            }
            return response;
          },
        },
      })
    : null;

export default supabase;
