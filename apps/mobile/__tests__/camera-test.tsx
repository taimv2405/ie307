import { act, fireEvent, renderHook } from "@testing-library/react-native";
import { renderRouter, testRouter } from "expo-router/testing-library";
import React from "react";
import * as ImagePicker from "expo-image-picker";
import { AppState, type AppStateStatus, Linking } from "react-native";

import {
  CAPTURE_FAILED,
  INFO_TIMEOUT_MS,
  useCameraPhoto,
} from "@/hooks/use-camera-photo";

const mockCopy = jest.fn();
// Tên các file đang có trong thư mục photos; null = thư mục chưa tồn tại.
let mockSavedFiles: string[] | null = null;

jest.mock("expo-file-system", () => {
  class MockFile {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = parts
        .map((p) => (typeof p === "string" ? p : (p as { uri: string }).uri))
        .join("/");
    }
    get name() {
      return this.uri.split("/").pop()!;
    }
    get extension() {
      return ".jpg";
    }
    copy(target: unknown) {
      return mockCopy(this, target);
    }
    delete() {}
  }
  class MockDirectory {
    uri: string;
    constructor(parent: { uri: string }, name: string) {
      this.uri = `${parent.uri}/${name}`;
    }
    get exists() {
      return mockSavedFiles !== null;
    }
    create() {}
    list() {
      return (mockSavedFiles ?? []).map((name) => new MockFile(this, name));
    }
  }
  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths: { document: { uri: "doc" } },
  };
});

jest.mock("expo-image-picker", () => ({
  useCameraPermissions: jest.fn(),
  launchCameraAsync: jest.fn(),
  getPendingResultAsync: jest.fn(),
}));

// Nút native của @expo/ui (SwiftUI/Compose) không render được trong Jest,
// nên thay bằng Pressable có cùng nhãn và hành vi disabled.
jest.mock("@expo/ui", () => {
  const React = jest.requireActual("react");
  const { Pressable, Text } = jest.requireActual("react-native");
  return {
    Host: ({ children }: { children: React.ReactNode }) => children,
    Button: ({
      label,
      onPress,
      disabled,
    }: {
      label: string;
      onPress: () => void;
      disabled?: boolean;
    }) =>
      React.createElement(
        Pressable,
        { onPress, disabled, accessibilityRole: "button" },
        React.createElement(Text, null, label),
      ),
  };
});
jest.mock("@expo/ui/swift-ui/modifiers", () => ({ controlSize: () => ({}) }));
jest.mock("expo-symbols", () => ({ SymbolView: () => null }));
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

// Test đầu tiên dựng cả cây Expo Router; lúc cache Jest còn lạnh có thể mất hơn 5 giây.
jest.setTimeout(20_000);

const picker = jest.mocked(ImagePicker);

// Chạy app thật qua Expo Router (cả _layout, trang chủ và màn hình ảnh) để test được điều hướng.
const renderIndex = async () => {
  const screen = await renderRouter("./src/app", { initialUrl: "/" });
  // Đi từ trang chủ vào màn hình chụp như người dùng thật.
  await fireEvent.press(screen.getByText("Nhặt từ"));
  expect(screen.getPathname()).toBe("/capture");
  return screen;
};

// Giống hook thật của expo-modules-core: requestPermission cập nhật state nên màn hình render lại.
function mockPermission(
  permission: Partial<ImagePicker.PermissionResponse> | null,
  afterRequest = permission,
) {
  let setStatus: (value: typeof permission) => void = () => {};
  const request = jest.fn(async () => {
    setStatus(afterRequest);
    return afterRequest;
  });
  const get = jest.fn(async () => permission);
  picker.useCameraPermissions.mockImplementation(() => {
    const [status, set] = React.useState(permission);
    setStatus = set;
    return [status as ImagePicker.PermissionResponse, request, get] as never;
  });
  return request;
}

describe("Nhặt từ (camera)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockSavedFiles = null;
    picker.getPendingResultAsync.mockResolvedValue(null);
    mockCopy.mockResolvedValue(undefined);
  });

  test("capture screen starts empty even when a photo was saved earlier", async () => {
    mockPermission({ granted: true, canAskAgain: true });
    mockSavedFiles = ["photo-100.jpg"];

    const { getByText, queryByLabelText } = await renderIndex();

    expect(queryByLabelText("Ảnh đã chụp")).toBeNull();
    getByText("Chụp ảnh");
  });

  test("shows the photo with a retake button after capturing", async () => {
    mockPermission({ granted: true, canAskAgain: true });
    picker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "cache/new.jpg", width: 1, height: 1 }],
    });
    const screen = await renderIndex();

    await fireEvent.press(screen.getByText("Chụp ảnh"));

    await screen.findByText("Chụp ảnh khác");
    expect(screen.getPathname()).toBe("/photo");
    // expo-image chuẩn hóa `source` thành mảng ở view native.
    expect(screen.getByLabelText("Ảnh đã chụp").props.source).toEqual([
      { uri: expect.stringMatching(/^doc\/photos\/photo-\d+\.jpg$/) },
    ]);

    // Nút back (header hoặc nút Back của Android) đưa về trang chủ.
    // Màn hình chụp được replace nên back về thẳng trang chủ.
    await testRouter.back("/");
    screen.getByText("Nhặt từ");
  });

  test("recovers a photo taken before Android recreated the activity", async () => {
    mockPermission({ granted: true, canAskAgain: true });
    picker.getPendingResultAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "cache/pending.jpg", width: 1, height: 1 }],
    });

    // Không bấm gì: app vừa khởi động lại ở trang chủ và tự mở ảnh đang chờ.
    const screen = await renderRouter("./src/app", { initialUrl: "/" });

    await screen.findByLabelText("Ảnh đã chụp");
    expect(screen.getPathname()).toBe("/photo");
    expect(mockCopy).toHaveBeenCalledWith(
      expect.objectContaining({ uri: "cache/pending.jpg" }),
      expect.anything(),
    );
  });

  test("shows a friendly message instead of the technical error", async () => {
    mockPermission({ granted: true, canAskAgain: true });
    picker.launchCameraAsync.mockRejectedValue(new Error("E_NATIVE_CRASH"));
    const { getByText, findByText, queryByText } = await renderIndex();

    await fireEvent.press(getByText("Chụp ảnh"));

    await findByText(CAPTURE_FAILED);
    expect(queryByText(/E_NATIVE_CRASH/)).toBeNull();
  });

  test("re-checks permission when the app returns to the foreground", async () => {
    const listeners: ((state: AppStateStatus) => void)[] = [];
    jest.spyOn(AppState, "addEventListener").mockImplementation((_, cb) => {
      listeners.push(cb);
      return { remove: jest.fn() };
    });
    mockPermission({ granted: false, canAskAgain: false });
    await renderIndex();
    const [, , getPermission] = picker.useCameraPermissions.mock.results.at(-1)!
      .value as [unknown, unknown, jest.Mock];

    await act(async () => listeners.forEach((cb) => cb("active")));

    expect(getPermission).toHaveBeenCalled();
  });

  test("asks for permission, takes a photo and saves it into the app folder", async () => {
    const request = mockPermission(
      { granted: false, canAskAgain: true },
      { granted: true, canAskAgain: true },
    );
    picker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "cache/abc.jpg", width: 1, height: 1 }],
    });
    const { getByText, findByLabelText } = await renderIndex();

    await fireEvent.press(getByText("Chụp ảnh"));

    await findByLabelText("Ảnh đã chụp");
    expect(request).toHaveBeenCalled();
    expect(mockCopy).toHaveBeenCalledWith(
      expect.objectContaining({ uri: "cache/abc.jpg" }),
      expect.objectContaining({
        uri: expect.stringMatching(/^doc\/photos\/photo-\d+\.jpg$/),
      }),
    );
  });

  test("does not open the camera when permission is denied", async () => {
    mockPermission(
      { granted: false, canAskAgain: true },
      { granted: false, canAskAgain: true },
    );
    const { getByText, findByText } = await renderIndex();

    await fireEvent.press(getByText("Chụp ảnh"));

    await findByText(/Cần quyền camera để chụp ảnh/);
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });

  test("offers Settings when permission is blocked", async () => {
    mockPermission({ granted: false, canAskAgain: false });
    const openSettings = jest
      .spyOn(Linking, "openSettings")
      .mockResolvedValue();
    const { getByText } = await renderIndex();

    await fireEvent.press(getByText("Mở Cài đặt"));

    expect(openSettings).toHaveBeenCalled();
  });

  test("reports when the user cancels", async () => {
    mockPermission({ granted: true, canAskAgain: true });
    picker.launchCameraAsync.mockResolvedValue({
      canceled: true,
      assets: null,
    });
    const { getByText, findByText } = await renderIndex();

    await fireEvent.press(getByText("Chụp ảnh"));

    await findByText("Đã hủy chụp ảnh.");
    expect(mockCopy).not.toHaveBeenCalled();
  });

  test("ignores a second tap while the camera is open", async () => {
    mockPermission({ granted: true, canAskAgain: true });
    let closeCamera!: (result: ImagePicker.ImagePickerResult) => void;
    picker.launchCameraAsync.mockReturnValue(
      new Promise((resolve) => (closeCamera = resolve)),
    );
    const { result } = await renderHook(() => useCameraPhoto(() => {}));

    // Gọi hai lần trong cùng một lượt render, trước khi state `busy` kịp cập nhật.
    await act(async () => {
      const first = result.current.takePhoto();
      const second = result.current.takePhoto();
      closeCamera({ canceled: true, assets: null });
      await Promise.all([first, second]);
    });

    expect(picker.launchCameraAsync).toHaveBeenCalledTimes(1);
  });

  test("explains the permission only until it is granted", async () => {
    const note = "Ứng dụng sẽ xin quyền dùng camera khi bạn bấm Chụp ảnh.";

    mockPermission({ granted: false, canAskAgain: true });
    const first = await renderIndex();
    first.getByText(note);
    first.getByText("Chụp một đồ vật hoặc dòng chữ tiếng Anh bạn muốn học.");
    await first.unmount();

    mockPermission({ granted: true, canAskAgain: true });
    const second = await renderIndex();
    expect(second.queryByText(note)).toBeNull();
  });
  test("does not tell a blocked user to tap a button that is gone", async () => {
    // iOS chỉ hỏi một lần: từ chối xong là bị chặn ngay.
    const blocked = { granted: false, canAskAgain: false };
    mockPermission({ granted: false, canAskAgain: true }, blocked);
    const { getByText, findByText, queryByText } = await renderIndex();

    await fireEvent.press(getByText("Chụp ảnh"));

    await findByText("Mở Cài đặt");
    expect(queryByText(/được hỏi lại/)).toBeNull();
    expect(queryByText("Chụp ảnh")).toBeNull();
  });

  test("hides info messages after a while but keeps errors", async () => {
    jest.useFakeTimers();
    try {
      mockPermission({ granted: true, canAskAgain: true });
      picker.launchCameraAsync.mockResolvedValue({
        canceled: true,
        assets: null,
      });
      const { getByText, queryByText } = await renderIndex();

      await fireEvent.press(getByText("Chụp ảnh"));
      getByText("Đã hủy chụp ảnh.");
      await act(async () => jest.advanceTimersByTime(INFO_TIMEOUT_MS));
      expect(queryByText("Đã hủy chụp ảnh.")).toBeNull();

      picker.launchCameraAsync.mockRejectedValue(new Error("boom"));
      await fireEvent.press(getByText("Chụp ảnh"));
      getByText(CAPTURE_FAILED);
      await act(async () => jest.advanceTimersByTime(INFO_TIMEOUT_MS * 2));
      getByText(CAPTURE_FAILED);
    } finally {
      jest.useRealTimers();
    }
  });
});
