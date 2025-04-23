import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import prettier from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  {
    plugins: {
      next,
      prettier,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
    },
  },
];
