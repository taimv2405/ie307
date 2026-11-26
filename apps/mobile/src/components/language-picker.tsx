import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isLanguage, LANGUAGE_NAMES, LANGUAGES, setLanguage } from "@/lib/i18n";

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
  const selected = isLanguage(current)
    ? { value: current, label: LANGUAGE_NAMES[current] }
    : undefined;

  return (
    <Select
      value={selected}
      onValueChange={(option) => {
        if (isLanguage(option?.value)) {
          // TODO: handle the rejected promise once the app has shared error reporting
          setLanguage(option.value);
        }
      }}
    >
      <SelectTrigger aria-label={t("language")} className="w-[180px]">
        <SelectValue placeholder={t("language")} />
      </SelectTrigger>
      <SelectContent insets={contentInsets} className="w-[180px]">
        {LANGUAGES.map((language) => (
          <SelectItem
            key={language}
            label={LANGUAGE_NAMES[language]}
            value={language}
          >
            {LANGUAGE_NAMES[language]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
