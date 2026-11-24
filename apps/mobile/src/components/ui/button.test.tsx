import { fireEvent, render } from "@testing-library/react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

describe("<Button />", () => {
  test.each([
    [
      { width: 64, height: 40 },
      { top: 4, bottom: 4, left: 0, right: 0 },
    ],
    [
      { width: 36, height: 36 },
      { top: 6, bottom: 6, left: 6, right: 6 },
    ],
    [
      { width: 30, height: 52 },
      { top: 0, bottom: 0, left: 9, right: 9 },
    ],
  ])("extends a %o layout to a 48dp touch target", async (layout, hitSlop) => {
    const { getByRole } = await render(
      <Button>
        <Text>Save</Text>
      </Button>,
    );
    const button = getByRole("button");

    await fireEvent(button, "layout", {
      nativeEvent: { layout: { x: 0, y: 0, ...layout } },
    });

    expect(button.props.hitSlop).toEqual(hitSlop);
  });

  test("clears hitSlop once the layout reaches 48dp", async () => {
    const { getByRole } = await render(
      <Button>
        <Text>Save</Text>
      </Button>,
    );
    const button = getByRole("button");

    await fireEvent(button, "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 36, height: 36 } },
    });
    expect(button.props.hitSlop).toEqual({
      top: 6,
      bottom: 6,
      left: 6,
      right: 6,
    });

    await fireEvent(button, "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 64, height: 48 } },
    });
    expect(button.props.hitSlop).toBeUndefined();
  });

  test("still calls onLayout", async () => {
    const onLayout = jest.fn();
    const { getByRole } = await render(
      <Button onLayout={onLayout}>
        <Text>Save</Text>
      </Button>,
    );

    await fireEvent(getByRole("button"), "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 64, height: 40 } },
    });

    expect(onLayout).toHaveBeenCalledTimes(1);
  });

  test("lets callers override hitSlop", async () => {
    const { getByRole } = await render(
      <Button hitSlop={20}>
        <Text>Save</Text>
      </Button>,
    );
    const button = getByRole("button");

    await fireEvent(button, "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 36, height: 36 } },
    });

    expect(button).toHaveProp("hitSlop", 20);
  });
});
