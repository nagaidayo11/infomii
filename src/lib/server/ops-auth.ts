import type { User } from "@supabase/supabase-js";

function readAdminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_OPS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

export function isOpsAdminUser(user: User): boolean {
  const hasAdminRoleClaim =
    user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin";
  if (hasAdminRoleClaim) {
    return true;
  }
  const email = user.email?.trim().toLowerCase() ?? "";
  if (!email) {
    return false;
  }
  return readAdminEmails().includes(email);
}
