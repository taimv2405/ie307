import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { homeFonts } from "./fonts";
import { homePalette as p } from "./palette";

type PickWordRowProps = {
  onPress?: () => void;
};

export function PickWordRow({ onPress }: PickWordRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Nhặt từ. Chụp chữ quanh bạn"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.badge}>
        <SymbolView
          name={{ ios: "camera", android: "photo_camera" }}
          size={28}
          tintColor={p.ink}
          accessible={false}
        />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Nhặt từ</Text>
        <Text style={styles.subtitle}>Chụp chữ quanh bạn</Text>
      </View>
      <SymbolView
        name={{ ios: "chevron.right", android: "chevron_right" }}
        size={22}
        tintColor={p.inkMuted}
        accessible={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: p.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: p.blush,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    fontFamily: homeFonts.extrabold,
    color: p.ink,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: homeFonts.semibold,
    color: p.inkMuted,
  },
});
