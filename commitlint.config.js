import { RuleConfigSeverity } from "@commitlint/types";

/**
 * @type {import('@commitlint/types').UserConfig}
 */
const config = {
  extends: ["@commitlint/config-conventional"],
  formatter: "@commitlint/format",
  rules: {
    "scope-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "components",
        "pages",
        "layouts",
        "islands",
        "utils",
        "config",
        "styles",
        "assets",
        "api",
        "deps",
        "ci",
      ],
    ],
  },
};

export default config;
