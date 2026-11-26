// https://docs.expo.dev/guides/using-eslint/
const fs = require("node:fs");
const path = require("node:path");
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier/flat");

const featuresDir = path.join(__dirname, "src/features");
const features = fs.existsSync(featuresDir)
  ? fs
      .readdirSync(featuresDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["eslint.config.js"],
    languageOptions: { globals: { __dirname: "readonly" } },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "import/no-named-as-default-member": "off",
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "import/no-cycle": "error",
      "import/no-restricted-paths": [
        "error",
        {
          basePath: __dirname,
          zones: [
            ...features.map((feature) => ({
              target: `./src/features/${feature}`,
              from: "./src/features",
              except: [`./${feature}`],
            })),
            {
              target: "./src/features",
              from: "./src/app",
            },
            {
              target: ["./src/components", "./src/hooks", "./src/lib"],
              from: ["./src/features", "./src/app"],
            },
          ],
        },
      ],
    },
  },
]);
