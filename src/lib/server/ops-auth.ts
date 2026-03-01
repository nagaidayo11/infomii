import type { User } from "@supabase/supabase-js";

const FIXED_OPS_ADMIN_EMAILS = new Set([
  "nagai9_119@ezweb.ne.jp",
  "nagaisoccer@gmail.com",
]);

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
  if (FIXED_OPS_ADMIN_EMAILS.has(email)) {
    return true;
  }
  return readAdminEmails().includes(email);
}
