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
  ".dark:root": "dark",
};

function toKey(name: string) {
  return name.replace(/-(\w)/g, (_, char: string) => char.toUpperCase());
}

function parseTokens(block: string) {
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      toKey(name),
      name === "radius" ? value.trim() : `hsl(${value.trim()})`,
    ]),
  );
}

const blocks = Object.fromEntries(
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, block]) => [
    schemes[selector.trim()],
    parseTokens(block),
  ]),
);

const themes = {
  light: blocks.light,
  dark: { ...blocks.light, ...blocks.dark },
};

describe("THEME", () => {
  test("matches the tokens in global.css", () => {
    expect(THEME).toEqual(themes);
  });
});
