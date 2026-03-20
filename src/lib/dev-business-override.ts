type AuthLikeUser = {
  email?: string | null;
  app_metadata?: { role?: unknown } | null;
  user_metadata?: { role?: unknown } | null;
};

const DEV_ROLES = new Set(["developer", "dev", "admin"]);

function readCsv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

function isOverrideFeatureEnabled(): boolean {
  return (
    process.env.DEV_BUSINESS_OVERRIDE === "true" ||
    process.env.NEXT_PUBLIC_DEV_BUSINESS_OVERRIDE === "true"
  );
}

function isProductionLocked(): boolean {
  const vercelEnv = (process.env.VERCEL_ENV ?? "").toLowerCase();
  if (vercelEnv === "production") {
    return process.env.ALLOW_DEV_BUSINESS_OVERRIDE_IN_PROD !== "true";
  }
  return false;
}

function resolveUserRole(user: AuthLikeUser): string {
  const role =
    user.app_metadata?.role ??
    user.user_metadata?.role ??
    "";
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

function resolveAllowEmails(): string[] {
  return [
    ...readCsv(process.env.DEV_BUSINESS_OVERRIDE_EMAILS),
    ...readCsv(process.env.NEXT_PUBLIC_DEV_BUSINESS_OVERRIDE_EMAILS),
  ];
}

export function canUseDevBusinessOverride(user: AuthLikeUser | null | undefined): boolean {
  if (!user) return false;
  if (!isOverrideFeatureEnabled()) return false;
  if (isProductionLocked()) return false;

  const role = resolveUserRole(user);
  if (DEV_ROLES.has(role)) {
    return true;
  }

  const allowEmails = resolveAllowEmails();
  if (allowEmails.length === 0) {
    return false;
  }

  const email = user.email?.trim().toLowerCase() ?? "";
  return email.length > 0 && allowEmails.includes(email);
}
