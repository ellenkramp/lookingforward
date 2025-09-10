// src/ui/Text.tsx
import { Platform, Text as RNText, TextProps } from "react-native";
import { useSettings } from "@/settings";

const families = {
  system: Platform.select({ ios: "System", android: "Roboto" })!,
  inter: "InterRegular",
  bebas: "BebasNeue",
  script: "Script",
  mono: "Mono",
};

export function AppText({ style, ...p }: TextProps) {
  const font = useSettings((s) => s.font);
  return (
    <RNText
      {...p}
      style={[{ fontFamily: families[font], includeFontPadding: false }, style]}
    />
  );
}

export function Num({ children, style, ...p }: TextProps) {
  const monoDigits = useSettings((s) => s.monoDigits);
  return (
    <RNText {...p} style={[monoDigits && { fontFamily: families.mono }, style]}>
      {children}
    </RNText>
  );
}
