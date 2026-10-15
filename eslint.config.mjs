import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import reactRefresh from 'eslint-plugin-react-refresh';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)), recommendedConfig: js.configs.recommended });
export default [
  { ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '**/_archived_app/**', '**/_archived_features/**'] },
  ...compat.config({
    overrides: [{
      files: ['src/**/*.{ts,tsx}'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
      parser: '@typescript-eslint/parser',
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      env: { browser: true, es2022: true },
    }],
  }),
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-refresh': reactRefresh },
    rules: { 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] },
  },
];
