import { router, Stack } from "expo-router";
import Settings from "lucide-react-native/icons/settings";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Stack.Screen
      options={{
        title: t("home.title"),
        headerRight: () => (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={t("settings.title")}
            onPress={() => router.push("/settings")}
          >
            <Icon as={Settings} size={24} />
          </Button>
        ),
      }}
    />
  );
}
