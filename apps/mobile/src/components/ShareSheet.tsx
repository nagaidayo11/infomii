import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Share as RNShare,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { publicPageUrl } from "@/lib/config";
import { selection, success } from "@/lib/haptics";
import type { ItineraryCard } from "@/types/itinerary";

type Props = {
  visible: boolean;
  item: ItineraryCard | null;
  onClose: () => void;
};

export function ShareSheet({ visible, item, onClose }: Props) {
  const shotRef = useRef<ViewShot>(null);
  if (!item) return null;

  const shareUrl = publicPageUrl(item.slug);

  async function shareLink() {
    void selection();
    await RNShare.share({
      message: `${item!.title}\n${shareUrl}`,
      url: shareUrl,
    });
  }

  async function shareImage() {
    void selection();
    try {
      const uri = await shotRef.current?.capture?.();
      if (!uri) return;
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: item!.title });
        void success();
      }
    } catch {
      /* capture failed on simulator */
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>旅を共有</Text>
        <Text style={styles.subtitle}>きれいなリンクと QR。管理画面の生 URL ではありません。</Text>

        <ViewShot ref={shotRef} options={{ format: "png", quality: 0.95 }}>
          <View style={styles.cardPreview}>
            <Image source={{ uri: item.coverImage }} style={styles.previewImage} contentFit="cover" />
            <View style={styles.previewOverlay} />
            <View style={styles.previewBody}>
              <Text style={styles.previewTitle}>{item.title}</Text>
              <Text style={styles.previewSub}>{item.subtitle}</Text>
            </View>
          </View>
        </ViewShot>

        <View style={styles.qrWrap}>
          <View style={styles.qrBox}>
            <QRCode value={shareUrl} size={140} color={colors.ink} backgroundColor="#fff" />
          </View>
          <Text style={styles.url} numberOfLines={2}>
            {shareUrl}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.btn} onPress={shareImage}>
            <Ionicons name="image-outline" size={20} color={colors.ink} />
            <Text style={styles.btnText}>画像で共有</Text>
          </Pressable>
          <Pressable style={styles.btnPrimary} onPress={shareLink}>
            <Ionicons name="link-outline" size={20} color="#fff" />
            <Text style={styles.btnPrimaryText}>リンクで共有</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.frost,
  },
  title: typography.subtitle,
  subtitle: typography.body,
  cardPreview: {
    height: 160,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  previewImage: { ...StyleSheet.absoluteFillObject },
  previewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(26,43,51,0.35)" },
  previewBody: { flex: 1, justifyContent: "flex-end", padding: spacing.lg },
  previewTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  previewSub: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 4 },
  qrWrap: { alignItems: "center", gap: spacing.md },
  qrBox: {
    padding: spacing.lg,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  url: { ...typography.caption, textAlign: "center", maxWidth: 280 },
  actions: { flexDirection: "row", gap: spacing.md },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.aqua,
  },
  btnText: { fontWeight: "600", color: colors.ink },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.accentDeep,
  },
  btnPrimaryText: { fontWeight: "600", color: "#fff" },
});
