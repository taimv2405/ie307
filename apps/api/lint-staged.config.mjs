import { defineConfig } from "lint-staged/config";

export default defineConfig({
  "*.{js,ts,mjs,cjs}": [
    "oxlint --type-aware --fix --deny-warnings",
    "prettier --write",
  ],
  "!(*.{js,ts,mjs,cjs})": "prettier --write --ignore-unknown",
});
