import * as Haptics from "expo-haptics";
import { Platform, Vibration } from "react-native";

export type HapticStyle =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "selection";

export function triggerNativeHaptic(style: HapticStyle = "light"): void {
  try {
    switch (style) {
      case "medium":
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      case "heavy":
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        return;
      case "success":
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      case "warning":
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      case "selection":
        void Haptics.selectionAsync();
        return;
      case "light":
      default:
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
    }
  } catch {
    if (Platform.OS === "android") {
      Vibration.vibrate(10);
    }
  }
}
