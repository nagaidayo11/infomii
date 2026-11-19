import { SUPPORT_EMAIL } from "@/lib/app-store-compliance";
import { contactTopicLabel, type ContactPayload } from "@/lib/contact";
import { sendSlackAlert } from "@/lib/server/slack-alert";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAIL_TO =
  process.env.CONTACT_EMAIL_TO?.trim() ||
  process.env.ALERT_EMAIL_TO?.trim() ||
  SUPPORT_EMAIL;
const CONTACT_EMAIL_FROM =
  process.env.CONTACT_EMAIL_FROM?.trim() ||
  process.env.ALERT_EMAIL_FROM?.trim() ||
  "Infomii <onboarding@resend.dev>";

export type SendContactResult = {
  delivered: boolean;
  detail: string;
};

export async function sendContactMessage(args: {
  payload: ContactPayload;
  userId?: string | null;
  userEmail?: string | null;
}): Promise<SendContactResult> {
  const { payload, userId, userEmail } = args;
  const topicLabel = contactTopicLabel(payload.topic);
  const subject = `【お問い合わせ】${topicLabel}`;
  const text = [
    `種別: ${topicLabel}`,
    payload.name ? `お名前: ${payload.name}` : null,
    `返信先: ${payload.email}`,
    userEmail && userEmail !== payload.email ? `ログイン中のメール: ${userEmail}` : null,
    userId ? `user_id: ${userId}` : "未ログイン",
    "",
    payload.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const slackLine = `${subject} from ${payload.email}${payload.name ? `（${payload.name}）` : ""}\n${payload.message.slice(0, 400)}`;
  try {
    await sendSlackAlert(slackLine);
  } catch {
    /* Slack is best-effort */
  }

  if (!RESEND_API_KEY) {
    return { delivered: false, detail: "RESEND_API_KEY が未設定です" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_EMAIL_FROM,
        to: [CONTACT_EMAIL_TO],
        reply_to: payload.email,
        subject,
        text,
      }),
    });
    const body = await response.text();
    if (!response.ok) {
      return { delivered: false, detail: `Resend ${response.status}: ${body}` };
    }
    return { delivered: true, detail: body || "Resend送信成功" };
  } catch {
    return { delivered: false, detail: "Resendへの接続に失敗しました" };
  }
}
