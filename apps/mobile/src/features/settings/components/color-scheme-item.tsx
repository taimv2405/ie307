import type { LucideIcon } from "lucide-react-native";
import Moon from "lucide-react-native/icons/moon";
import Sun from "lucide-react-native/icons/sun";
import SunMoon from "lucide-react-native/icons/sun-moon";
import { useTranslation } from "react-i18next";

import { Icon } from "@/components/ui/icon";
import {
  APP_COLOR_SCHEMES,
  type AppColorScheme,
  useColorSchemePreference,
  useSetColorSchemePreference,
} from "@/lib/color-scheme";

import { SettingsSelect } from "./settings-select";

const COLOR_SCHEME_ICONS: Record<AppColorScheme, LucideIcon> = {
  system: SunMoon,
  light: Sun,
  dark: Moon,
};

export function ColorSchemeItem() {
  const { t } = useTranslation();
  const colorSchemePreference = useColorSchemePreference();
  const setColorSchemePreference = useSetColorSchemePreference();

  return (
    <SettingsSelect
      title={t("settings.colorScheme.title")}
      value={colorSchemePreference}
      options={APP_COLOR_SCHEMES.map((scheme) => ({
        value: scheme,
        label: t(`settings.colorScheme.${scheme}`),
        icon: <Icon as={COLOR_SCHEME_ICONS[scheme]} className="size-4" />,
      }))}
      onValueChange={setColorSchemePreference}
    />
  );
}
