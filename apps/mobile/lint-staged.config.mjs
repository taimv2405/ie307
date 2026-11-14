import { defineConfig } from "lint-staged/config";

export default defineConfig({
  "*.{js,jsx,ts,tsx,mjs,cjs}": [
    "eslint --fix --max-warnings=0 --no-warn-ignored",
    "prettier --write",
  ],
  "!(*.{js,jsx,ts,tsx,mjs,cjs})": "prettier --write --ignore-unknown",
});
