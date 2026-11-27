import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { z } from "zod";

import { createStorageItem } from "@/lib/storage";
import enTranslations from "@/translations/en.json";
import viTranslations from "@/translations/vi.json";

export const resources = {
  en: { translation: enTranslations },
  vi: { translation: viTranslations },
} as const;

export type AppLanguage = keyof typeof resources;

export const APP_LANGUAGES = Object.keys(resources) as AppLanguage[];

export const FALLBACK_LANGUAGE: AppLanguage = "en";

export const APP_LANGUAGE_INFO: Record<
  AppLanguage,
  { name: string; flag: string }
> = {
  en: { name: "English", flag: "🇬🇧" },
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
};

const languageSchema = z.enum(APP_LANGUAGES);

const languageStorage = createStorageItem("language", languageSchema);

export function isAppLanguage(value: unknown): value is AppLanguage {
  return languageSchema.safeParse(value).success;
}

export async function setLanguage(language: AppLanguage) {
  await i18n.changeLanguage(language);
  await languageStorage.set(language);
}

export function initI18n() {
  if (i18n.isInitialized) {
    return;
  }
  i18n.use(initReactI18next).init({
    resources,
    lng:
      languageStorage.get() ??
      getLocales().at(0)?.languageCode ??
      FALLBACK_LANGUAGE,
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: APP_LANGUAGES,
    interpolation: { escapeValue: false },
    react: { transSupportBasicHtmlNodes: false },
  });
}
