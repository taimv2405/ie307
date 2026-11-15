import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHomeStats } from "@/hooks/use-home-stats";

import { DueReviewCard } from "./due-review-card";
import { ManageCardsRow } from "./manage-cards-row";
import { homePalette as p } from "./palette";
import { PickWordRow } from "./pick-word-row";

type HomeScreenProps = {
  onPickWord?: () => void;
};

export function HomeScreen({ onPickWord }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { dueCount, totalCards } = useHomeStats();

  return (
    <ScrollView
      // Nền trang chủ luôn sáng theo bản thiết kế nên chữ thanh trạng thái luôn tối.
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cài đặt"
          style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
        >
          <SymbolView
            name={{ ios: "gearshape", android: "settings" }}
            size={24}
            tintColor={p.ink}
            accessible={false}
          />
        </Pressable>
      </View>

      <DueReviewCard dueCount={dueCount} />
      <PickWordRow onPress={onPickWord} />
      <ManageCardsRow totalCards={totalCards} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: p.background,
  },
  content: {
    paddingHorizontal: 24,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  settings: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: p.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
