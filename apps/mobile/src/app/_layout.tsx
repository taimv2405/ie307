import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import { homeFontFiles } from "@/components/home/fonts";

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(homeFontFiles);

  // Splash screen vẫn hiện cho tới khi font tải xong; lỗi font thì dùng font hệ thống.
  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Trang chủ tự vẽ toàn màn hình theo bản thiết kế, không dùng header. */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="capture" options={{ title: "Nhặt từ" }} />
        <Stack.Screen name="photo" options={{ title: "Ảnh đã chụp" }} />
      </Stack>
    </ThemeProvider>
  );
}
