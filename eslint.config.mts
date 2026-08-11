import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      js
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser
    }
  },
  tseslint.configs.recommended, // Use TypeScript ESLint recommended rules
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    rules: {
      // Align ESLint with tsconfig's noUnusedParameters: a leading underscore marks a
      // parameter as intentionally unused. Required for Express error handlers, whose
      // 4-argument shape is what identifies them, even when `next` is never called.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
    },
  },
]);
