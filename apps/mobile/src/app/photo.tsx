import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";

import { CameraScreen } from "@/components/camera-screen";

export default function Photo() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();

  return (
    <CameraScreen
      captureLabel="Chụp ảnh khác"
      // Chụp lại thì thay ảnh tại chỗ, nút back vẫn về thẳng trang chủ.
      onCaptured={(next) => router.setParams({ uri: next })}
    >
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        accessible
        accessibilityLabel="Ảnh đã chụp"
      />
    </CameraScreen>
  );
}
