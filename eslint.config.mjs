import { FlatCompat } from '@eslint/eslintrc';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ['node_modules/**', 'legacy/**'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
    },
    rules: {
      'comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      quotes: ['error', 'single'],
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, rootDir: 'src', prefix: '@' },
      ],
    },
  },
];

export default eslintConfig;
