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
            'no-else-return':    1,
            'space-unary-ops':   2
        }
    },
    {

        // Stylistic rules documentation: https://eslint.style/packages/js
        plugins: {
            '@stylistic/js': stylisticJs
        },
        rules: {

            // 0 - off. 1 - warn. 2 - error
            // can use strings. ex: 'warn' 
            'semi':                     [1, 'always'],
            'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
            'quotes':                   [1, 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true }],
            'arrow-parens':             [1, 'as-needed'],
            'array-bracket-newline':    [1, { 'multiline': true }],
            'block-spacing':            [1, 'always'],
            'brace-style':              [1, '1tbs', { 'allowSingleLine': true}],
            'comma-dangle':             [
                0, 
                'always',
                {
                    'arrays':    'always',
                    'objects':   'always',
                    'imports':   'always',
                    'exports':   'always',
                    'functions': 'always'
                }
            ],
            'comma-spacing':                  [1, { 'after': true}],
            'computed-property-spacing':      [1, 'never'],
            'dot-location':                   [1, 'property'],
            'eol-last':                       [1, 'always'],
            'func-call-spacing':              [1, 'never'],
            'function-call-argument-newline': [1, 'consistent'],
            'function-paren-newline':         [1, 'multiline'],
            'implicit-arrow-linebreak':       [0, 'beside'],
            'indent':                         [1, 4],
            'jsx-quotes':                     [1, 'prefer-double'],
            'key-spacing':                    [1, {'align': 'value', 'beforeColon': false}],
            'keyword-spacing':                [1, {'before': true, 'after': true}],
            'lines-around-comment':           [1, {'beforeBlockComment': true, 'beforeLineComment': true}],

            // ignores jsdocs
            'multiline-comment-style':  [0, 'separate-lines'],
            'multiline-ternary':        [1, 'always-multiline'],
            'new-parens':               [1, 'always'],
            'newline-per-chained-call': [1, {'ignoreChainWithDepth': 3}],
            'no-confusing-arrow':       [1, {'allowParens': true, 'onlyOneSimpleParam': true}],
            'no-extra-parens':          [
                1, 'all', {
                    'nestedBinaryExpressions':          false, 
                    'ternaryOperandBinaryExpressions':  false, 
                    'enforceForArrowConditionals':      false, 
                    'enforceForNewInMemberExpressions': false
                }
            ]

            // ...
        }
    }
];
