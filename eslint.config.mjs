import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // RPC results are decoded from XDR into untyped JS before parsing.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default config;
