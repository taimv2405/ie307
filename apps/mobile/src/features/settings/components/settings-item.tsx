import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

type SettingsItemProps = {
  label: string;
  children: ReactNode;
};

export function SettingsItem({ label, children }: SettingsItemProps) {
  return (
    <View className="flex-row flex-wrap items-center justify-between gap-4">
      <Text className="font-medium">{label}</Text>
      {children}
    </View>
  );
}
