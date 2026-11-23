import { THEME } from "@/lib/theme";

const fs = jest.requireActual<{
  readFileSync(path: string, encoding: "utf8"): string;
}>("fs");
const path = jest.requireActual<{
  resolve(...segments: string[]): string;
}>("path");

const css = fs.readFileSync(
  path.resolve(expect.getState().testPath ?? "", "../../global.css"),
  "utf8",
);

const schemes: Record<string, string> = {
  ":root": "light",
};

function parseTokens(block: string) {
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      `rgb(${value.trim()})`,
    ]),
  );
}

const themes = Object.fromEntries(
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, block]) => [
    schemes[selector.trim()],
    parseTokens(block),
  ]),
);

describe("THEME", () => {
  test("matches the tokens in global.css", () => {
    expect(THEME).toEqual(themes);
  });
});
