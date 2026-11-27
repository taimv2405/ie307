import { colorScheme } from "nativewind";
import {
  createContext,
  type ReactNode,
  use,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { AppState } from "react-native";
import { z } from "zod";

import { createStorageItem } from "@/lib/storage";

export const APP_COLOR_SCHEMES = ["system", "light", "dark"] as const;

export type AppColorScheme = (typeof APP_COLOR_SCHEMES)[number];

const DEFAULT_COLOR_SCHEME: AppColorScheme = "system";

const colorSchemeStorage = createStorageItem(
  "colorScheme",
  z.enum(APP_COLOR_SCHEMES),
);

function getStoredColorScheme(): AppColorScheme {
  return colorSchemeStorage.get() ?? DEFAULT_COLOR_SCHEME;
}

export function initColorScheme() {
  colorScheme.set(getStoredColorScheme());
}

const StateContext = createContext<AppColorScheme>(DEFAULT_COLOR_SCHEME);
StateContext.displayName = "ColorSchemeStateContext";

const SetContext = createContext<((scheme: AppColorScheme) => void) | null>(
  null,
);
SetContext.displayName = "ColorSchemeSetContext";

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(getStoredColorScheme);

  function setColorSchemePreference(scheme: AppColorScheme) {
    setPreference(scheme);
    colorScheme.set(scheme);
    // TODO: handle the rejected promise once the app has shared error reporting
    colorSchemeStorage.set(scheme);
  }

  // expo-system-ui resets the native night mode to follow the system whenever
  // the Android activity is recreated (e.g. after a font scale change), while JS
  // keeps running, so re-apply the saved preference when the app becomes active.
  const onAppActive = useEffectEvent(() => {
    colorScheme.set(preference);
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        onAppActive();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <StateContext value={preference}>
      <SetContext value={setColorSchemePreference}>{children}</SetContext>
    </StateContext>
  );
}

export function useColorSchemePreference() {
  return use(StateContext);
}

export function useSetColorSchemePreference() {
  const setColorSchemePreference = use(SetContext);
  if (!setColorSchemePreference) {
    throw new Error(
      "useSetColorSchemePreference must be used within ColorSchemeProvider",
    );
  }
  return setColorSchemePreference;
}
