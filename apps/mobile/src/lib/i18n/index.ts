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

export type Language = keyof typeof resources;

export const LANGUAGES = Object.keys(resources) as Language[];

export const FALLBACK_LANGUAGE: Language = "en";

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

const LANGUAGE_KEY = "language";

function getStoredLanguage() {
  const stored = Storage.getItemSync(LANGUAGE_KEY);
  return isLanguage(stored) ? stored : null;
}

export async function setLanguage(language: Language) {
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
  supportedLngs: LANGUAGES,
  interpolation: { escapeValue: false },
  react: { transSupportBasicHtmlNodes: false },
});

export default i18n;
