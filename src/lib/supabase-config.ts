const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isConfiguredSupabaseUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  if (value.includes("your-project-ref")) {
    return false;
  }
  return value.startsWith("https://");
}

function isConfiguredSupabaseAnonKey(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  if (value.includes("your-anon-key")) {
    return false;
  }
  return value.length > 20;
}

export const hasSupabaseEnv =
  isConfiguredSupabaseUrl(SUPABASE_URL) &&
  isConfiguredSupabaseAnonKey(SUPABASE_ANON_KEY);

export { SUPABASE_URL, SUPABASE_ANON_KEY };
