# nhặt

Chụp trang sách tiếng Anh → chạm một từ → app tô cả cụm chứa từ đó (kể cả cụm bị tách như "picked it up"), cho nghĩa tiếng Việt đúng theo câu, IPA và phát âm.

Bản thử hiện có 2 màn: **Camera** và **Ảnh đã chụp + Tra từ**. Chưa có lưu thẻ và ôn thẻ.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `mobile/` | App Expo SDK 58 / React Native 0.88 (Expo Router). OCR trên máy bằng Google ML Kit (`@infinitered/react-native-mlkit-text-recognition`), phát âm bằng `expo-speech`. |
| `server/` | Backend tra cứu: giữ key Gemini, gọi `gemini-3.1-flash-lite` (dự phòng `gemini-3.5-flash-lite`), lấy IPA từ CMUdict. Node ≥ 22, không có dependency. |

Luồng khi chạm một từ: ML Kit trả về từng từ kèm vị trí → app nối dòng (cả từ bị ngắt bằng gạch nối), tách câu → gửi câu (dạng danh sách từ) và vị trí từ được chạm lên `POST /lookup` → server trả về dạng gốc/cụm, các vị trí từ thuộc cụm, nghĩa Việt, IPA, và chữ đã sửa nếu OCR đọc sai.

Key Gemini chỉ nằm ở server, không bao giờ nằm trong APK.

## Chạy thử trên điện thoại Android (cắm USB)

1. Chạy server:

   ```bash
   cd server && cp .env.example .env   # rồi điền GEMINI_KEYS=key1,key2
   npm run setup                        # tải CMUdict một lần
   npm start
   ```

2. Cho điện thoại gọi tới server trên PC qua cáp USB:

   ```bash
   adb reverse tcp:8787 tcp:8787
   ```

3. Build và cài app (bản release, JS đóng gói sẵn trong APK):

   ```bash
   cd mobile && npm install
   npx expo prebuild --platform android
   cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
   adb install -r app/build/outputs/apk/release/app-release.apk
   ```

   Muốn sửa code và thấy kết quả ngay thì dùng `npx expo run:android` (bản dev, cần Metro).

Địa chỉ server nằm ở `mobile/app.json` → `expo.extra.apiUrl` (mặc định `http://127.0.0.1:8787`, đi qua `adb reverse`). Muốn dùng không cần cáp thì đổi thành IP LAN của PC, hoặc deploy server lên Cloud Run.

## Ghi chú

- Ảnh được thu về cạnh dài 2048 px trước khi OCR. Đo trên Redmi Note 12: khoảng 0,57 giây, so với 1,1 giây khi giữ nguyên ảnh 12 MP.
- Thẻ tra từ hiện thời gian tra để tiện thử độ trễ.
- Key Gemini gói miễn phí bị giới hạn 15 request/phút. Server xoay vòng các key trong `GEMINI_KEYS` và chuyển sang model dự phòng khi gặp lỗi 429/503 hoặc quá thời gian chờ.
