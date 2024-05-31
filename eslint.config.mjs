import globals from 'globals';
import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
    {
        files: ['**/*.js'],
        languageOptions:
        {sourceType: 'commonjs',}
    },
    {
        languageOptions:
        {globals: globals.node}
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
        plugins: {'@stylistic/js': stylisticJs},
        rules:   {

            // 0 - off. 1 - warn. 2 - error
            // can use strings. ex: 'warn' 
            'arrow-parens':          [1, 'as-needed'],
            'array-bracket-newline': [1, { 'multiline': true }],
            'block-spacing':         [1, 'always'],
            'brace-style':           [1, '1tbs', { 'allowSingleLine': true}],
            'comma-dangle':          [
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
            ],
            'no-extra-semi':            1,
            'no-floating-decimal':      1,
            'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
            'no-multi-spaces':          [
                1,
                {
                    'ignoreEOLComments': true,
                    'exceptions':        {
                        'Property':           true,
                        'VariableDeclarator': true,
                        'ImportDeclaration':  true,
                    }
                }
            ],
            'no-trailing-spaces':               [1, {'ignoreComments': true}],
            'no-whitespace-before-property':    1,
            'nonblock-statement-body-position': [0, 'beside'],
            'object-curly-newline':             [
                1, {
                    'multiline':     true,
                    'minProperties': 4,
                }
            ],
            'object-property-newline':         [1, {'allowAllPropertiesOnSameLine': true}],
            'operator-linebreak':              [1, 'after', {'overrides': {}}],
            'padded-blocks':                   [0, 'never'],
            'padding-line-between-statements': 0, // https://eslint.style/rules/js/padding-line-between-statements
            'quote-props':                     [
                1, 'as-needed', {
                    'numbers':     true,
                    'keywords':    true,
                    'unnecessary': false
                }
            ],
            'quotes':                      [1, 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true }],
            'rest-spread-spacing':         [1, 'never'],
            'semi':                        [1, 'always'],
            'semi-spacing':                1,
            'semi-style':                  [0, 'last'],
            'space-before-blocks':         1,
            'space-before-function-paren': [0, 'always'],
            'space-in-parens':             [1, 'never'],
            'space-infix-ops':             1,
            'space-unary-ops':             [1, {'words': true, 'nonwords': false}],
            'spaced-comment':              [1, 'always'],
            'switch-colon-spacing':        [1, {'after': true, 'before': false}],
            'template-curly-spacing':      [0, 'never'],
            'wrap-iife':                   [1, 'any'],
            'wrap-regex':                  1,
            'yield-star-spacing':          0,



            // ...
        }
    }
];
