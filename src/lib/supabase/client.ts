import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return null to allow graceful fallback to seeded mock state in local development
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
