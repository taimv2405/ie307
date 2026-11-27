import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";

import { LanguagePicker } from "./language-picker";

export function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("settings") }} />
      <ScrollView contentContainerClassName="p-4">
        <View className="flex-row flex-wrap items-center justify-between gap-4">
          <Text className="font-medium">{t("language")}</Text>
          <LanguagePicker />
        </View>
      </ScrollView>
    </>
  );
}
