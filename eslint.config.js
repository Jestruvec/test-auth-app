// @ts-check

import eslint from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import prettier from "eslint-plugin-prettier/recommended";
import VuePlugin from "eslint-plugin-vue";
import cspellRecommended from "@cspell/eslint-plugin/recommended";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import globals from "globals";

import nodePath from "node:path";
import { fileURLToPath } from "node:url";

const _dirname = nodePath.dirname(fileURLToPath(import.meta.url));

export default defineConfigWithVueTs(
  {
    ignores: [
      "**/dist/**/*",
      "**/node_modules/**/*",
      "**/public/**",
      "**/coverage/**/*",
      "**/test-results/**/*",
    ],
    files: ["**/*.config.{js,ts}"],
  },
  eslint.configs.recommended,
  VuePlugin.configs["flat/recommended"],
  vueTsConfigs.strictTypeChecked,
  vueTsConfigs.stylisticTypeChecked,
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
    files: ["packages/domains/*/src/generated/**/*.ts"],
    // Disable some rules for generated files from OpenAPI specs
    // Abbreviations like params, ref, etc are common in OpenAPI specs
    // It's better to keep the generated code as close to the spec as possible
    // rather than trying to enforce naming conventions that might not fit well
    // with the generated content.
    // Any types are unavoidable in generated files due complexity of some specs
    // but should not infect the rest of the codebase and preserve strict typing
    // on itself and the rest of the codebase.
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-misused-spread": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/array-type": "off",
      "unicorn/no-immediate-mutation": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-useless-switch-case": "off",
      "unicorn/prefer-string-slice": "off",
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
  {
    ignores: [
      "**/dist/**/*",
      "**/node_modules/**/*",
      "**/public/**",
      "**/coverage/**/*",
    ],
  }
);
