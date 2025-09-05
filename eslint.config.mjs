import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const ignores = ['.next', '.vscode', 'node_modules', 'out', 'coverage', 'tests', 'package.json', 'next-env.d.ts'];

const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  { ignores },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  eslintPluginPrettierRecommended,
  {
    rules: {
      'react/no-unescaped-entities': ['warn', { forbid: ['>', '"', '}'] }],
      '@next/next/no-html-link-for-pages': 'off',
      'react/jsx-no-target-blank': 'warn',
      '@next/next/no-img-element': 'off',
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default eslintConfig;
