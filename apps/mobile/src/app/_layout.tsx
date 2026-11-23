import "../global.css";

import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";

import { NAV_THEME } from "@/lib/theme";

export default function RootLayout() {
  return (
    <ThemeProvider value={NAV_THEME.light}>
      <Stack />
    </ThemeProvider>
  );
}
