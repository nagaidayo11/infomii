import { createClient } from "@supabase/supabase-js";
import {
  hasSupabaseEnv,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/supabase-config";
import type { Database } from "@/types/supabase";

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function getBrowserSupabaseClient() {
  if (!hasSupabaseEnv || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return cachedClient;
}
