import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";

// Ảnh chụp ban đầu nằm trong cache, hệ thống có thể xóa bất cứ lúc nào,
// nên copy sang thư mục document do ứng dụng quản lý.
export const CAPTURE_FAILED = "Không chụp hoặc lưu được ảnh. Hãy thử lại.";

export const INFO_TIMEOUT_MS = 4000;

export type CameraMessage = { text: string; tone: "info" | "error" };

const photosDir = () => new Directory(Paths.document, "photos");

async function persistPhoto(sourceUri: string): Promise<string> {
  const dir = photosDir();
  dir.create({ intermediates: true, idempotent: true });
  const source = new File(sourceUri);
  const target = new File(
    dir,
    `photo-${Date.now()}${source.extension || ".jpg"}`,
  );
  await source.copy(target);
  // Chỉ giữ ảnh mới nhất.
  for (const item of dir.list()) {
    if (item instanceof File && item.uri !== target.uri) item.delete();
  }
  return target.uri;
}

/**
 * Android có thể tạo lại MainActivity khi camera hệ thống đang mở; app khởi động lại
 * ở trang chủ nên ảnh vừa chụp phải được lấy lại ở đó. Trả về URI ảnh đã lưu, hoặc
 * null nếu không có ảnh nào đang chờ (luôn null trên iOS).
 */
export async function recoverPendingCapture(): Promise<string | null> {
  const pending = await ImagePicker.getPendingResultAsync();
  if (!pending) return null;
  if ("code" in pending) throw new Error(pending.message);
  const uri = pending.canceled ? undefined : pending.assets?.[0]?.uri;
  return uri ? persistPhoto(uri) : null;
}

/**
 * Xin quyền, mở camera hệ thống và lưu ảnh vào thư mục của app.
 * `onCaptured` nhận URI ảnh đã lưu; màn hình gọi hook quyết định hiển thị ảnh ở đâu.
 */
export function useCameraPhoto(onCaptured: (uri: string) => void) {
  const [permission, requestPermission, getPermission] =
    ImagePicker.useCameraPermissions();
  // Giữ callback mới nhất mà không làm takePhoto đổi identity mỗi lần render.
  const onCapturedRef = useRef(onCaptured);
  useEffect(() => {
    onCapturedRef.current = onCaptured;
  }, [onCaptured]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<CameraMessage | null>(null);
  // State chỉ cập nhật ở lần render sau; ref chặn được hai lần bấm liên tiếp.
  const busyRef = useRef(false);

  const handleResult = useCallback(
    async (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled) {
        setMessage({ text: "Đã hủy chụp ảnh.", tone: "info" });
        return;
      }
      const asset = result.assets?.[0];
      if (!asset?.uri) throw new Error("Camera không trả về ảnh.");
      onCapturedRef.current(await persistPhoto(asset.uri));
    },
    [],
  );

  // Người dùng chỉ thấy câu dễ hiểu; chi tiết kỹ thuật ghi vào log để debug.
  const fail = useCallback((error: unknown) => {
    console.warn("[camera]", error);
    setMessage({ text: CAPTURE_FAILED, tone: "error" });
  }, []);

  // Câu báo tự ẩn; câu lỗi giữ tới lần thao tác sau để người dùng kịp đọc cách xử lý.
  useEffect(() => {
    if (message?.tone !== "info") return;
    const timer = setTimeout(() => setMessage(null), INFO_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [message]);

  // Người dùng có thể đổi quyền trong Settings rồi quay lại app, nên kiểm tra lại.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  const blocked =
    permission !== null && !permission.granted && !permission.canAskAgain;
  const granted = permission?.granted ?? false;

  const takePhoto = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      let current = permission ?? (await getPermission());
      if (!current.granted && current.canAskAgain)
        current = await requestPermission();
      if (!current.granted) {
        // Bị chặn hẳn thì màn hình đã chuyển sang trạng thái "Mở Cài đặt" và tự giải thích;
        // chỉ nhắc "bấm lại" khi hệ điều hành còn cho hỏi lại.
        if (current.canAskAgain) {
          setMessage({
            text: "Cần quyền camera để chụp ảnh. Bấm Chụp ảnh để được hỏi lại.",
            tone: "error",
          });
        }
        return;
      }
      await handleResult(await ImagePicker.launchCameraAsync({ quality: 0.8 }));
    } catch (e) {
      fail(e);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [permission, getPermission, requestPermission, handleResult, fail]);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch((e) => {
      console.warn("[camera]", e);
      setMessage({
        text: "Không mở được Cài đặt. Hãy tự bật camera trong Cài đặt của máy.",
        tone: "error",
      });
    });
  }, []);

  return {
    busy,
    message,
    granted,
    blocked,
    takePhoto,
    openSettings,
  };
}
