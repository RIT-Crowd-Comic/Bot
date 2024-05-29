import globals from "globals";
import pluginJs from "@eslint/js";
import stylisticJs from '@stylistic/eslint-plugin-js';

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
            "no-else-return": 1,
            "space-unary-ops": 2
        }
    },
    {
        plugins: {
            '@stylistic/js': stylisticJs
        },
        rules: {
            'indent': ['warn', 4],
            "semi": [1, "always"],
            // ...
        }
    }
];