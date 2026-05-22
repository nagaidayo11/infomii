export const APP_PUBLIC_URL =
  process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://infomii.com";

export function publicPageUrl(slug: string): string {
  return `${APP_PUBLIC_URL}/p/${slug}`;
}
