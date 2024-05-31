import globals from 'globals';
import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
    {
        files: ['**/*.js'],
        languageOptions:
    {
        sourceType: 'commonjs',
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
        // ESLint rules documentation: https://eslint.org/docs/latest/rules
        'rules': {
            'consistent-return': 2,
            'no-else-return': 1,
            'space-unary-ops': 2
        }
    },
    {
        // Stylistic rules documentation: https://eslint.style/packages/js
        plugins: {
            '@stylistic/js': stylisticJs
        },
        rules: {
            'indent': ['warn', 4],
            'semi': [1, 'always'],
            'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
            'quotes': [1, 'single', {'allowTemplateLiterals': true, 'avoidEscape': true}]
            // ...
        }
    }
];