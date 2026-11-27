import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import { LanguageItem } from "./components/language-item";
import { ThemeItem } from "./components/theme-item";

export function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("settings.title") }} />
      <ScrollView contentContainerClassName="gap-4 p-4">
        <ThemeItem />
        <LanguageItem />
      </ScrollView>
    </>
  );
}
