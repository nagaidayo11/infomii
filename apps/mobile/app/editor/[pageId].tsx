import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthenticatedWebView } from "@/components/AuthenticatedWebView";
import { APP_PUBLIC_URL } from "@/lib/config";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";

export default function WebEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pageId } = useLocalSearchParams<{ pageId: string }>();

  const id = typeof pageId === "string" ? pageId : "";
  const uri = id ? `${APP_PUBLIC_URL}/editor/${id}` : APP_PUBLIC_URL;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Web エディタ</Text>
        <View style={styles.spacer} />
      </View>
      <AuthenticatedWebView uri={uri} style={styles.web} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.warmWhite },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.frost,
  },
  title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.ink },
  spacer: { width: 24 },
  web: { flex: 1 },
});
