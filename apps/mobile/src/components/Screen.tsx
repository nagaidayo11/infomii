import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  bottomInset?: number;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  contentStyle,
  bottomInset = 0,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={[
        padded && styles.padded,
        { paddingTop: insets.top + spacing.md, paddingBottom: bottomInset + spacing.xl },
        !scroll && styles.fill,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[colors.warmWhite, colors.mist, colors.aqua]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollGrow}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.warmWhite },
  padded: { paddingHorizontal: spacing.screen },
  fill: { flex: 1, width: "100%" },
  scrollGrow: { flexGrow: 1 },
});
