import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-hooks/exhaustive-deps": "warn", // downgrade to warning
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/rules-of-exhaustive-deps": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-props-no-spreading": "off",
      "react/jsx-no-constructed-context-values": "off",
      "react/no-unstable-nested-components": "off",
      "react/no-children-prop": "off",
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
      "react/jsx-key": "warn",
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn",
      "react/jsx-no-target-blank": [
        "error",
        {
          enforceDynamicLinks: "always",
          allowReferrer: true,
        },
      ],
      "react/jsx-no-script-url": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-filename-extension": ["error", { extensions: [".js", ".jsx", ".tsx", ".ts"] }],
      "react/react-jsx-props-no-spreading": "off",
      "react/jsx-props-no-spreading": "off",
      "react/no-array-index-key": "off",
      "react/no-unused-state": "off",
      "react/no-did-update-set-state": "off",
      "react/no-deprecated": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-is-mounted": "error",
      "react/no-multi-comp": "off",
      "react/no-redundant-should-component-update": "error",
      "react/no-render-return-value": "error",
      "react/no-string-refs": "error",
      "react/no-this-in-sfc": "error",
      "react/no-typos": "error",
      "react/no-unsafe": "error",
      "react/no-unused-prop-types": "off",
      "react/no-unused-state": "off",
      "react/no-will-update-set-state": "error",
      "react/prefer-es6-class": "error",
      "react/prefer-stateless-function": "off",
      "react/require-default-props": "off",
      "react/require-optimization": "off",
      "react/sort-comp": [
        "error",
        {
          order: [
            "static-methods",
            "instance-variables",
            "lifecycle",
            "render",
            "everything-else",
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
