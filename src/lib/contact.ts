import { SUPPORT_EMAIL } from "@/lib/app-store-compliance";

export const CONTACT_TOPICS = [
  { id: "usability", label: "使いづらい点" },
  { id: "feature", label: "機能・ブロックの要望" },
  { id: "consult", label: "導入・使い方の相談" },
  { id: "other", label: "その他" },
] as const;

export type ContactTopicId = (typeof CONTACT_TOPICS)[number]["id"];

export const CONTACT_MESSAGE_MAX = 4000;
export const CONTACT_NAME_MAX = 80;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isContactTopicId(value: string | null | undefined): value is ContactTopicId {
  return CONTACT_TOPICS.some((topic) => topic.id === value);
}

export function contactTopicLabel(id: ContactTopicId): string {
  return CONTACT_TOPICS.find((topic) => topic.id === id)?.label ?? "その他";
}

export function normalizeContactEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidContactEmail(value: string): boolean {
  const email = normalizeContactEmail(value);
  return email.length <= 254 && EMAIL_RE.test(email);
}

export type ContactPayload = {
  topic: ContactTopicId;
  message: string;
  email: string;
  name: string;
};

export function validateContactPayload(input: {
  topic?: unknown;
  message?: unknown;
  email?: unknown;
  name?: unknown;
}): { ok: true; value: ContactPayload } | { ok: false; error: string } {
  const topic = typeof input.topic === "string" && isContactTopicId(input.topic) ? input.topic : "other";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const email = typeof input.email === "string" ? normalizeContactEmail(input.email) : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";

  if (!message) return { ok: false, error: "本文を書いてください。" };
  if (message.length > CONTACT_MESSAGE_MAX) {
    return { ok: false, error: `本文は${CONTACT_MESSAGE_MAX}文字以内にしてください。` };
  }
  if (!isValidContactEmail(email)) return { ok: false, error: "返信先のメールアドレスを確認してください。" };
  if (name.length > CONTACT_NAME_MAX) {
    return { ok: false, error: `お名前は${CONTACT_NAME_MAX}文字以内にしてください。` };
  }

  return { ok: true, value: { topic, message, email, name } };
}

export function buildContactMailto(payload: ContactPayload): string {
  const subject = `【Infomii】${contactTopicLabel(payload.topic)}`;
  const body = [
    payload.name ? `お名前: ${payload.name}` : null,
    `返信先: ${payload.email}`,
    "",
    payload.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
  return `mailto:${SUPPORT_EMAIL}?cc=${encodeURIComponent(payload.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildBlankContactMailto(): string {
  return `mailto:${SUPPORT_EMAIL}`;
}
