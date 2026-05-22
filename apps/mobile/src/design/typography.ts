import { TextStyle } from "react-native";
import { colors } from "./colors";

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: colors.ink,
  } satisfies TextStyle,
  title: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: colors.ink,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
    color: colors.inkMuted,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.inkFaint,
  } satisfies TextStyle,
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.inkFaint,
  } satisfies TextStyle,
};
