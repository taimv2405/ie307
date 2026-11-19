import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";

import { homeFontFiles } from "@/components/home/fonts";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(homeFontFiles);

  // Splash screen vẫn hiện cho tới khi font tải xong; lỗi font thì dùng font hệ thống.
  if (!fontsLoaded && !fontError) return null;

  return (
    <Stack>
      {/* Trang chủ tự vẽ toàn màn hình theo bản thiết kế, không dùng header. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
