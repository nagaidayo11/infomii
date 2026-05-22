import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@/design/spacing";
import { typography } from "@/design/typography";

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, marginBottom: spacing.lg },
  title: typography.hero,
  subtitle: { ...typography.body, marginTop: spacing.xs },
});
