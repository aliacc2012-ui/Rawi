import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Supabase client for use in Client Components.
 * Reads publishable, browser-safe env vars only — never the service role key.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new SupabaseNotConfiguredError();
  }

  return createBrowserClient<Database>(url, anonKey);
}

/**
 * Thrown whenever Supabase env vars are missing so the UI can show
 * "not configured" states instead of silently faking success.
 * See RAWI spec §35 — never fake auth, uploads, or writes.
 */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
    this.name = "SupabaseNotConfiguredError";
  }
}
