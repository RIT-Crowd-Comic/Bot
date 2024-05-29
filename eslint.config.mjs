import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    files: ["**/*.js"],
    languageOptions:
    {
      sourceType: "commonjs",
    }
  },
  {
    languageOptions:
    {
      globals: globals.node
    }
  },
  pluginJs.configs.recommended,
  {
    "rules": {
      "consistent-return": 2,
      "indent": [1, "tab"],
      "no-else-return": 1,
      "semi": [1, "always"],
      "space-unary-ops": 2
    }
  }
];