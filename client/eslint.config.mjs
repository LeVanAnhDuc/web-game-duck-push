import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/*
 * eslint-config-next 16 đã xuất thẳng mảng flat config, nên bọc qua FlatCompat
 * làm ESLint nổ "Converting circular structure to JSON" trước khi đọc file nào.
 */
export default [
  ...coreWebVitals,
  ...typescript,
  {
    // Luật chung của workspace — R-12 và R-21 trong code-conventions.md.
    rules: {
      "arrow-body-style": ["error", "as-needed"],
      "object-shorthand": "warn",
      "react/jsx-fragments": ["warn", "syntax"],
      "@typescript-eslint/array-type": ["warn", { default: "array" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" }
      ]
    }
  },
  { ignores: [".next/**", "out/**", "node_modules/**", "public/**"] }
];
