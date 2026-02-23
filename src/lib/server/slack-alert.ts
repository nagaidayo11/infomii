const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export async function sendSlackAlert(message: string): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    return;
  }

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch {
    // Alert failures must not break core request handling.
  }
}
