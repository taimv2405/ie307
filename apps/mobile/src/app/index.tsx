import { useRouter } from "expo-router";
import { useEffect } from "react";

import { HomeScreen } from "@/components/home/home-screen";
import { recoverPendingCapture } from "@/hooks/use-camera-photo";

export default function Index() {
  const router = useRouter();

  // App luôn khởi động lại ở trang chủ, nên ảnh chụp dở (Android) được lấy lại ở đây.
  useEffect(() => {
    recoverPendingCapture()
      .then((uri) => {
        if (uri) router.push({ pathname: "/photo", params: { uri } });
      })
      .catch((e) => console.warn("[camera]", e));
  }, [router]);

  return <HomeScreen onPickWord={() => router.push("/capture")} />;
}
