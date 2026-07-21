import { Platform, Share } from "react-native";

type SharePayload = {
  title?: string;
  url: string;
  message?: string;
};

export async function shareViaNativeSheet(payload: SharePayload): Promise<boolean> {
  const url = payload.url?.trim();
  if (!url) return false;
  const title = payload.title?.trim() || "Infomii";
  const message = payload.message?.trim() || url;
  try {
    const result = await Share.share(
      Platform.OS === "ios"
        ? { title, url }
        : { title, message: `${message}\n${url}` },
      { subject: title, dialogTitle: title },
    );
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}
