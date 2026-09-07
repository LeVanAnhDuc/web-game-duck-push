import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/*
 * eslint-config-next 16 đã xuất thẳng mảng flat config, nên bọc qua FlatCompat
 * làm ESLint nổ "Converting circular structure to JSON" trước khi đọc file nào.
 */
export default [
  ...coreWebVitals,
  ...typescript,
  { ignores: [".next/**", "out/**", "node_modules/**", "public/**"] }
];
