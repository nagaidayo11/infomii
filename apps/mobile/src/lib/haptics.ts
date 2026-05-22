import * as Haptics from "expo-haptics";

export async function tapLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* simulator */
  }
}

export async function tapSoft() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } catch {
    /* simulator */
  }
}

export async function selection() {
  try {
    await Haptics.selectionAsync();
  } catch {
    /* simulator */
  }
}

export async function success() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* simulator */
  }
}
