import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export default function Index() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center">
      <Text>{t("welcome")}</Text>
    </View>
  );
}
