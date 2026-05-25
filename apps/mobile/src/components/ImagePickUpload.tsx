import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { uploadPageAsset } from "@/lib/upload-page-asset";
import { useAuth } from "@/stores/auth-provider";

type Props = {
  value?: string;
  onChange: (uri: string | undefined) => void;
  uploadPrefix: string;
  label?: string;
  height?: number;
};

export function ImagePickUpload({ value, onChange, uploadPrefix, label, height = 160 }: Props) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("権限が必要です", "写真ライブラリへのアクセスを許可してください。");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const localUri = result.assets[0].uri;
    if (!user) {
      onChange(localUri);
      return;
    }

    setUploading(true);
    const { url, error } = await uploadPageAsset(localUri, uploadPrefix);
    setUploading(false);
    if (error && !url) {
      Alert.alert("アップロードできませんでした", error);
      onChange(localUri);
      return;
    }
    onChange(url ?? localUri);
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {value ? (
        <View style={[styles.previewWrap, { height }]}>
          <Image source={{ uri: value }} style={styles.preview} contentFit="cover" />
          {uploading ? (
            <View style={styles.overlay}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null}
        </View>
      ) : (
        <Pressable style={[styles.placeholder, { height }]} onPress={() => void pickImage()}>
          <Ionicons name="image-outline" size={32} color={colors.inkFaint} />
          <Text style={styles.placeholderText}>写真を選ぶ</Text>
        </Pressable>
      )}
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => void pickImage()} disabled={uploading}>
          <Text style={styles.actionText}>{value ? "画像を変更" : "ライブラリから選択"}</Text>
        </Pressable>
        {value ? (
          <Pressable style={styles.actionBtn} onPress={() => onChange(undefined)} disabled={uploading}>
            <Text style={[styles.actionText, styles.danger]}>削除</Text>
          </Pressable>
        ) : null}
      </View>
      {!user ? (
        <Text style={styles.hint}>未ログイン時は端末内に保持。保存・公開時にアップロードします。</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { fontSize: 13, fontWeight: "600", color: colors.inkMuted },
  previewWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.frost,
  },
  preview: { width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.frost,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
  },
  placeholderText: { fontSize: 14, color: colors.inkMuted, fontWeight: "500" },
  actions: { flexDirection: "row", gap: spacing.md },
  actionBtn: { paddingVertical: spacing.xs },
  actionText: { fontSize: 14, fontWeight: "600", color: colors.accentDeep },
  danger: { color: colors.danger },
  hint: { fontSize: 12, color: colors.inkFaint, lineHeight: 18 },
});
