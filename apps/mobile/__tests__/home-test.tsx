import { fireEvent, render } from "@testing-library/react-native";

import { HomeScreen } from "@/components/home/home-screen";
import { useHomeStats } from "@/hooks/use-home-stats";

jest.mock("expo-symbols", () => ({ SymbolView: () => null }));
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("@/hooks/use-home-stats", () => ({
  ...jest.requireActual("@/hooks/use-home-stats"),
  useHomeStats: jest.fn(),
}));

const mockedStats = jest.mocked(useHomeStats);

describe("<HomeScreen />", () => {
  test("shows the numbers that come from useHomeStats", async () => {
    // Số khác với mock mặc định để chắc màn hình không viết cứng 12/148.
    mockedStats.mockReturnValue({ dueCount: 3, totalCards: 40 });

    const { getByText, getByLabelText } = await render(<HomeScreen />);

    getByText("3");
    getByText("thẻ đang chờ bạn ôn");
    getByText("40 thẻ");
    getByLabelText("Cài đặt");
  });

  test("uses the mock numbers by default", async () => {
    mockedStats.mockImplementation(
      jest.requireActual("@/hooks/use-home-stats").useHomeStats,
    );

    const { getByText } = await render(<HomeScreen />);

    getByText("12");
    getByText("148 thẻ");
  });

  test("Nhặt từ calls onPickWord", async () => {
    mockedStats.mockReturnValue({ dueCount: 12, totalCards: 148 });
    const onPickWord = jest.fn();
    const { getByText } = await render(<HomeScreen onPickWord={onPickWord} />);

    await fireEvent.press(getByText("Nhặt từ"));

    expect(onPickWord).toHaveBeenCalled();
  });
});
