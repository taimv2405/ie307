import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { homeFonts } from "./fonts";
import { homePalette as p } from "./palette";

type ManageCardsRowProps = {
  totalCards: number;
  onPress?: () => void;
};

export function ManageCardsRow({ totalCards, onPress }: ManageCardsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Quản lý thẻ, ${totalCards} thẻ`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.label}>Quản lý thẻ</Text>
      <View style={styles.meta}>
        <Text style={styles.count}>{totalCards} thẻ</Text>
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right" }}
          size={20}
          tintColor={p.inkMuted}
          accessible={false}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingLeft: 22,
    paddingRight: 16,
    borderRadius: 999,
    backgroundColor: p.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 16,
    fontFamily: homeFonts.bold,
    color: p.ink,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  // Chữ số của M PLUS Rounded rộng đều (tabular) nên nhỏ hơn nhãn 1 cỡ cho cân.
  count: {
    fontSize: 15,
    fontFamily: homeFonts.semibold,
    color: p.inkMuted,
  },
});
