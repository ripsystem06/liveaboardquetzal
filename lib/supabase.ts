import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const CREW_DOCS_BUCKET = 'crew-docs'

let adminClient: SupabaseClient | null = null

/**
 * Returns a lazily-initialized Supabase client using the SECRET key
 * (`SUPABASE_SECRET_KEY`, the `sb_secret_...` API key).
 *
 * This client bypasses RLS and must NEVER be exposed to the browser. It is
 * used exclusively server-side (route handlers / server components) to upload,
 * sign, and remove objects in the private `crew-docs` bucket.
 *
 * Throws a descriptive error if the required environment variables are not
 * configured, instead of silently no-op'ing.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!url) {
    throw new Error(
      'Supabase is not configured: SUPABASE_URL is missing. ' +
        'Set it in your environment before using crew-registration storage.'
    )
  }
  if (!secretKey) {
    throw new Error(
      'Supabase is not configured: SUPABASE_SECRET_KEY is missing. ' +
        'Set it in your environment before using crew-registration storage.'
    )
  }

  if (!adminClient) {
    adminClient = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }

  return adminClient
}
