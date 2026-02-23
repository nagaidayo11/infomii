import { sendSlackAlert } from "@/lib/server/slack-alert";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO;
const ALERT_EMAIL_FROM = process.env.ALERT_EMAIL_FROM ?? "Store Ops <onboarding@resend.dev>";

type AlertChannelResult = {
  ok: boolean;
  detail: string;
};

async function sendEmailAlert(subject: string, message: string): Promise<AlertChannelResult> {
  if (!RESEND_API_KEY || !ALERT_EMAIL_TO) {
    return { ok: false, detail: "RESEND_API_KEY または ALERT_EMAIL_TO が未設定です" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ALERT_EMAIL_FROM,
        to: [ALERT_EMAIL_TO],
        subject,
        text: message,
      }),
    });
    const text = await response.text();
    if (!response.ok) {
      return { ok: false, detail: `Resend ${response.status}: ${text}` };
    }
    return { ok: true, detail: text || "Resend送信成功" };
  } catch {
    return { ok: false, detail: "Resendへの接続に失敗しました" };
  }
}

export async function sendOpsAlert(subject: string, message: string): Promise<{
  slack: AlertChannelResult;
  email: AlertChannelResult;
}> {
  let slackResult: AlertChannelResult = { ok: true, detail: "Slack送信成功" };
  try {
    await sendSlackAlert(`[${subject}] ${message}`);
  } catch {
    slackResult = { ok: false, detail: "Slack送信に失敗しました" };
  }

  const emailResult = await sendEmailAlert(subject, message);
  return {
    slack: slackResult,
    email: emailResult,
  };
}
