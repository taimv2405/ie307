import { useTheme } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useEffect } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useCameraPhoto } from "@/hooks/use-camera-photo";

type CameraScreenProps = {
  /** Nội dung trong khung lớn: trạng thái rỗng ở màn hình chụp, ảnh ở màn hình ảnh. */
  children: ReactNode;
  /** Nhãn nút chụp khi không bận. */
  captureLabel: string;
  onCaptured: (uri: string) => void;
};

export function CameraScreen({
  children,
  captureLabel,
  onCaptured,
}: CameraScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { busy, message, granted, blocked, takePhoto, openSettings } =
    useCameraPhoto(onCaptured);

  // Đọc thông báo cho người dùng trình đọc màn hình (VoiceOver/TalkBack).
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message.text);
  }, [message]);

  const secondary = { color: colors.text, opacity: 0.65 };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: 8,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      {/* Trang chủ ép chữ thanh trạng thái màu tối; màn hình này theo theme. */}
      <StatusBar style="auto" />
      {/* Khung co giãn theo chỗ trống nên nút luôn nằm trong màn hình. */}
      <View style={[styles.stage, { backgroundColor: colors.card }]}>
        {children}
      </View>

      <View style={styles.controls}>
        {message ? (
          <Text
            style={[
              styles.note,
              message.tone === "error"
                ? { color: colors.text, fontWeight: "600" }
                : secondary,
            ]}
          >
            {message.text}
          </Text>
        ) : null}

        {blocked ? (
          <>
            <Text style={[styles.note, secondary]}>
              Camera đang bị tắt cho ứng dụng này. Bật lại trong Cài đặt để chụp
              ảnh.
            </Text>
            <PrimaryButton label="Mở Cài đặt" onPress={openSettings} />
          </>
        ) : (
          <>
            {!granted && !message ? (
              <Text style={[styles.note, secondary]}>
                Ứng dụng sẽ xin quyền dùng camera khi bạn bấm {captureLabel}.
              </Text>
            ) : null}
            <PrimaryButton
              label={busy ? "Đang mở camera…" : captureLabel}
              onPress={takePhoto}
              disabled={busy}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 20,
  },
  stage: {
    flex: 1,
    minHeight: 0,
    borderRadius: 16,
    borderCurve: "continuous",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    alignItems: "center",
    gap: 12,
  },
  note: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
});
