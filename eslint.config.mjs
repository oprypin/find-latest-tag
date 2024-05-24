import {FlatCompat} from "@eslint/eslintrc";
import js from "@eslint/js";

const config = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true,
    },
    "ignorePatterns": ["docs/", "site/"],
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
    },
    "parserOptions": {
        "ecmaVersion": 2020,
    },
    "rules": {
        "no-empty": ["error", {"allowEmptyCatch": true}],
        "no-unused-vars": ["error", {"caughtErrors": "none"}],
        "prefer-const": "error",

        "block-scoped-var": "error",
        "consistent-return": "error",
        "curly": "error",
        "eqeqeq": "error",
        "no-floating-decimal": "error",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-multi-spaces": "error",
        "no-multi-str": "error",
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-useless-return": "error",
        "require-await": "error",
        "yoda": "error",

        "brace-style": "error",
        "camelcase": "error",
        "comma-dangle": ["error", "always-multiline"],
        "comma-spacing": "error",
        "comma-style": "error",
        "computed-property-spacing": "error",
        "eol-last": "error",
        "func-call-spacing": "error",
        "implicit-arrow-linebreak": "error",
        "indent": "error",
        "key-spacing": "error",
        "keyword-spacing": "error",
        "max-len": ["error", {"code": 100, "ignoreStrings": true, "ignoreTemplateLiterals": true}],
        "no-mixed-operators": "error",
        "no-multiple-empty-lines": "error",
        "no-trailing-spaces": "error",
        "no-unneeded-ternary": "error",
        "no-whitespace-before-property": "error",
        "object-curly-spacing": ["error", "never"],
        "operator-assignment": "error",
        "padded-blocks": ["error", "never"],
        "quotes": "error",
        "semi": "error",
        "semi-spacing": "error",
        "semi-style": "error",
        "space-before-function-paren": ["error", {
            "anonymous": "always", "named": "never", "asyncArrow": "always",
        }],
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": "error",
        "switch-colon-spacing": "error",
        "template-tag-spacing": "error",
        "unicode-bom": "error",

        "arrow-body-style": "error",
        "arrow-parens": "error",
        "arrow-spacing": "error",
        "generator-star-spacing": ["error", "after"],
        "no-duplicate-imports": "error",
        "no-var": "error",
        "prefer-destructuring": "error",
        "prefer-numeric-literals": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "rest-spread-spacing": "error",
        "sort-imports": "error",
        "template-curly-spacing": "error",
        "yield-star-spacing": "error",
    },
};

const compat = new FlatCompat({recommendedConfig: js.configs.recommended});
export default compat.config(config);