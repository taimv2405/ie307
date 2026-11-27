import { useTranslation } from "react-i18next";

import { Text } from "@/components/ui/text";
import {
  APP_LANGUAGE_INFO,
  APP_LANGUAGES,
  isAppLanguage,
  setLanguage,
} from "@/lib/i18n";

import { SettingsSelect } from "./settings-select";

const LANGUAGE_OPTIONS = APP_LANGUAGES.map((language) => ({
  value: language,
  label: APP_LANGUAGE_INFO[language].name,
  icon: <Text className="text-sm">{APP_LANGUAGE_INFO[language].flag}</Text>,
}));

export function LanguageItem() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <SettingsSelect
      label={t("settings.language.title")}
      value={isAppLanguage(current) ? current : undefined}
      options={LANGUAGE_OPTIONS}
      onValueChange={(language) => {
        // TODO: handle the rejected promise once the app has shared error reporting
        setLanguage(language);
      }}
    />
  );
}
