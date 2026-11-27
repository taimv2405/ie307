import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import {
  isAppLanguage,
  type AppLanguage,
  APP_LANGUAGE_INFO,
  APP_LANGUAGES,
  setLanguage,
} from "@/lib/i18n";

function LanguageFlag({ language }: { language: AppLanguage }) {
  return (
    <Text aria-hidden className="text-sm">
      {APP_LANGUAGE_INFO[language].flag}
    </Text>
  );
}

export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };
  const current = i18n.resolvedLanguage;
  const selected = isAppLanguage(current)
    ? { value: current, label: APP_LANGUAGE_INFO[current].name }
    : undefined;

  return (
    <Select
      value={selected}
      onValueChange={(option) => {
        if (isAppLanguage(option?.value)) {
          // TODO: handle the rejected promise once the app has shared error reporting
          setLanguage(option.value);
        }
      }}
    >
      <SelectTrigger
        aria-label={t("language")}
        aria-valuetext={selected?.label}
        className="min-w-[140px]"
      >
        <View className="flex-row items-center gap-2">
          {selected && <LanguageFlag language={selected.value} />}
          <SelectValue placeholder={t("language")} />
        </View>
      </SelectTrigger>
      <SelectContent insets={contentInsets} className="min-w-[140px]">
        {APP_LANGUAGES.map((language) => (
          <SelectItem
            key={language}
            label={APP_LANGUAGE_INFO[language].name}
            value={language}
            icon={<LanguageFlag language={language} />}
          />
        ))}
      </SelectContent>
    </Select>
  );
}
