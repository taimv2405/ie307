import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

type SettingsItemProps = {
  title: string;
  children: ReactNode;
};

export function SettingsItem({ title, children }: SettingsItemProps) {
  return (
    <View className="flex-row flex-wrap items-center justify-between gap-4">
      <Text className="font-medium">{title}</Text>
      {children}
    </View>
  );
}
