import { DefaultTheme, type Theme } from "expo-router/react-navigation";

export const THEME = {
  light: {
    background: "rgb(244 251 249)",
    foreground: "rgb(22 29 28)",
    card: "rgb(255 255 255)",
    "card-foreground": "rgb(22 29 28)",
    popover: "rgb(227 233 232)",
    "popover-foreground": "rgb(22 29 28)",
    primary: "rgb(0 106 100)",
    "primary-foreground": "rgb(255 255 255)",
    secondary: "rgb(204 232 228)",
    "secondary-foreground": "rgb(50 75 73)",
    muted: "rgb(233 239 237)",
    "muted-foreground": "rgb(63 73 71)",
    accent: "rgb(227 233 232)",
    "accent-foreground": "rgb(22 29 28)",
    destructive: "rgb(186 26 26)",
    "destructive-foreground": "rgb(255 255 255)",
    border: "rgb(190 201 199)",
    input: "rgb(111 121 119)",
    ring: "rgb(0 106 100)",
  },
};

export const NAV_THEME: Record<keyof typeof THEME, Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.background,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
};
