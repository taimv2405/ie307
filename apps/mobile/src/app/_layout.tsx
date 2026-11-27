import "@/global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { ColorSchemeProvider, initColorScheme } from "@/lib/color-scheme";
import { initI18n } from "@/lib/i18n";
import { NAV_THEME } from "@/lib/theme";

export { ErrorBoundary } from "expo-router";

initI18n();
initColorScheme();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ColorSchemeProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack />
        <PortalHost />
      </ThemeProvider>
    </ColorSchemeProvider>
  );
}
