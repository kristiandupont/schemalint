import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  { ignores: ["**/build", "**/example", "**/node_modules"] },
  ...fixupConfigRules(compat.extends("@kristiandupont")),
  {
    languageOptions: { globals: { ...globals.node } },

    rules: { "@typescript-eslint/prefer-nullish-coalescing": "off" },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: { createDefaultProgram: true, project: "./tsconfig.json" },
    },
  },
];
