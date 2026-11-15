import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { homeFonts } from "./fonts";
import { homePalette as p } from "./palette";

type DueReviewCardProps = {
  dueCount: number;
  onReview?: () => void;
};

export function DueReviewCard({ dueCount, onReview }: DueReviewCardProps) {
  return (
    <View
      style={styles.section}
      accessibilityLabel={`${dueCount} thẻ đang chờ bạn ôn`}
    >
      {/* Tấm thẻ nghiêng phía sau tạo cảm giác một xấp thẻ. */}
      <View style={styles.backing} />
      <View style={styles.card}>
        <Text style={styles.count}>{dueCount}</Text>
        <Text style={styles.caption}>thẻ đang chờ bạn ôn</Text>
        <Pressable
          onPress={onReview}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          {/* Một dòng: nhãn nút không được xuống dòng rồi bị chiều cao nút cắt mất. */}
          <Text style={styles.ctaLabel} numberOfLines={1}>
            Ôn ngay
          </Text>
          <SymbolView
            name={{ ios: "arrow.right", android: "arrow_forward" }}
            size={22}
            tintColor={p.onCoral}
            accessible={false}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    height: 262,
    marginRight: 8,
    marginBottom: 8,
  },
  backing: {
    position: "absolute",
    top: 12,
    right: -6,
    bottom: -8,
    left: 10,
    borderWidth: 2.5,
    borderColor: p.ink,
    borderRadius: 24,
    backgroundColor: p.blush,
    transform: [{ rotate: "2deg" }],
  },
  card: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: 24,
    borderWidth: 2.5,
    borderColor: p.ink,
    borderRadius: 24,
    backgroundColor: p.surface,
    boxShadow: `4px 4px 0 ${p.ink}`,
  },
  // Đo theo bản thiết kế (Baloo 2, 96px): chữ số cao ~60, "12" rộng ~86.
  // M PLUS Rounded có chữ số cao hơn (0,73em) và rộng đều nhau (tabular),
  // nên giảm cỡ, kéo hai số lại gần và bù khoảng trắng bên trái số "1"
  // để mép chữ số thẳng hàng với dòng chữ bên dưới.
  count: {
    fontSize: 82,
    lineHeight: 96,
    letterSpacing: -6,
    marginLeft: -8,
    fontFamily: homeFonts.extrabold,
    color: p.coral,
  },
  caption: {
    fontSize: 20,
    lineHeight: 30,
    fontFamily: homeFonts.bold,
    color: p.ink,
  },
  cta: {
    marginTop: "auto",
    height: 56,
    borderWidth: 2.5,
    borderColor: p.ink,
    borderRadius: 999,
    backgroundColor: p.coral,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.9,
  },
  ctaLabel: {
    fontSize: 19,
    fontFamily: homeFonts.extrabold,
    color: p.onCoral,
  },
});
