import { getLocales } from "expo-localization";
import Storage from "expo-sqlite/kv-store";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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

export function isAppLanguage(value: unknown): value is AppLanguage {
  return APP_LANGUAGES.includes(value as AppLanguage);
}

const LANGUAGE_KEY = "language";

function getStoredLanguage() {
  const stored = Storage.getItemSync(LANGUAGE_KEY);
  return isAppLanguage(stored) ? stored : null;
}

export async function setLanguage(language: AppLanguage) {
  await i18n.changeLanguage(language);
  await Storage.setItem(LANGUAGE_KEY, language);
}

i18n.use(initReactI18next).init({
  resources,
  lng:
    getStoredLanguage() ??
    getLocales().at(0)?.languageCode ??
    FALLBACK_LANGUAGE,
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: APP_LANGUAGES,
  interpolation: { escapeValue: false },
  react: { transSupportBasicHtmlNodes: false },
});

export default i18n;
