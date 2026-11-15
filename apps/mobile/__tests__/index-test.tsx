import { render } from "@testing-library/react-native";

import Index from "@/app/index";

describe("<Index />", () => {
  test("renders the placeholder text", async () => {
    const { getByText } = await render(<Index />);
    getByText("Edit src/app/index.tsx to edit this screen.");
  });
});
