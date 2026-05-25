import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { selection } from "@/lib/haptics";

export function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "url";
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "url" ? "none" : "sentences"}
        editable={editable}
      />
    </View>
  );
}

export function FieldSwitch({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

export function ListEditor({
  title,
  children,
  onAdd,
}: {
  title: string;
  children: ReactNode;
  onAdd: () => void;
}) {
  return (
    <View style={styles.list}>
      <Text style={styles.listTitle}>{title}</Text>
      {children}
      <Pressable
        style={styles.addBtn}
        onPress={() => {
          void selection();
          onAdd();
        }}
      >
        <Ionicons name="add" size={18} color={colors.accentDeep} />
        <Text style={styles.addText}>行を追加</Text>
      </Pressable>
    </View>
  );
}

export function ListRowShell({
  index,
  total,
  onUp,
  onDown,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.rowCard}>
      <View style={styles.rowTop}>
        <Text style={styles.rowIndex}>行 {index + 1}</Text>
        <View style={styles.rowActions}>
          <Pressable onPress={onUp} disabled={index === 0} hitSlop={6}>
            <Ionicons name="chevron-up" size={16} color={index === 0 ? colors.inkFaint : colors.ink} />
          </Pressable>
          <Pressable onPress={onDown} disabled={index >= total - 1} hitSlop={6}>
            <Ionicons
              name="chevron-down"
              size={16}
              color={index >= total - 1 ? colors.inkFaint : colors.ink}
            />
          </Pressable>
          <Pressable onPress={onRemove} hitSlop={6}>
            <Ionicons name="trash-outline" size={16} color={colors.inkFaint} />
          </Pressable>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.inkMuted, marginBottom: 4 },
  field: { gap: 4, marginBottom: spacing.sm },
  input: {
    fontSize: 14,
    color: colors.ink,
    padding: spacing.sm,
    backgroundColor: colors.warmWhite,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.frost,
  },
  inputMulti: { minHeight: 72, textAlignVertical: "top" },
  inputDisabled: { opacity: 0.7, backgroundColor: colors.frost },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  switchLabel: { fontSize: 14, color: colors.ink },
  list: { gap: spacing.sm, marginBottom: spacing.md },
  listTitle: { fontSize: 14, fontWeight: "700", color: colors.ink },
  rowCard: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowIndex: { fontSize: 12, fontWeight: "600", color: colors.inkFaint },
  rowActions: { flexDirection: "row", gap: spacing.sm },
  addBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm },
  addText: { fontSize: 14, fontWeight: "600", color: colors.accentDeep },
});
