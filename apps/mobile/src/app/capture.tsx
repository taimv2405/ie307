import { useRouter, useTheme } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { CameraScreen } from "@/components/camera-screen";

export default function Capture() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <CameraScreen
      captureLabel="Chụp ảnh"
      // replace: back từ màn hình ảnh về thẳng trang chủ, không quay lại màn hình chụp.
      onCaptured={(uri) =>
        router.replace({ pathname: "/photo", params: { uri } })
      }
    >
      <View style={styles.empty}>
        <SymbolView
          name={{ ios: "camera", android: "photo_camera" }}
          size={44}
          // Màu chữ (không dùng primary) vì nút Android lấy màu Material riêng.
          tintColor={colors.text}
          style={{ opacity: 0.65 }}
          accessible={false}
        />
        <Text style={[styles.body, { color: colors.text }]}>
          Chụp một đồ vật hoặc dòng chữ tiếng Anh bạn muốn học.
        </Text>
      </View>
    </CameraScreen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
});
