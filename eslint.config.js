// @ts-check
import eslint from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import prettier from "eslint-plugin-prettier/recommended";
import astro from "eslint-plugin-astro";
import VuePlugin from "eslint-plugin-vue";
import cspellRecommended from "@cspell/eslint-plugin/recommended";
import vueTsConfigs from "@vue/eslint-config-typescript";
import globals from "globals";
import tseslint from "typescript-eslint";

import nodePath from "node:path";
import { fileURLToPath } from "node:url";

const _dirname = nodePath.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [
      "**/dist/**/*",
      "**/node_modules/**/*",
      "**/public/**",
      "**/coverage/**/*",
      "**/test-results/**/*",
      "**/.astro/**/*",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...VuePlugin.configs["flat/recommended"],
  ...vueTsConfigs(),
  unicorn.configs["recommended"],
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.builtin,
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: _dirname,
      },
    },
    rules: {
      "unicorn/no-null": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
          },
        },
      ],
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-base-to-string": "off",
    },
  },
  {
    files: ["**/*.vue"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
    },
  },
  {
    files: ["**/*.astro"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
    },
  },
  cspellRecommended,
  {
    rules: {
      "@cspell/spellchecker": [
        "warn",
        {
          autoFix: true,
          cspell: {
            import: ["@cspell/dict-es-es"],
          },
          cspellOptionsRoot: _dirname,
        },
      ],
    },
  },
  prettier,
];
