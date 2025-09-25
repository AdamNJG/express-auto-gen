import { defineConfig, globalIgnores } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import stylisticTs from '@stylistic/eslint-plugin'; 
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([{
  extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),

  languageOptions: {
    parser: tsParser
  },

  plugins: {
    '@stylistic/ts': stylisticTs
  },

  rules: {
    semi: ['error', 'always'],

    '@stylistic/ts/quotes': ['error', 'single', {
      'avoidEscape': true,
      'allowTemplateLiterals': 'always'
    }],

    'indent': ['error', 2],
    'comma-dangle': ['error', 'never'],

    'no-multiple-empty-lines': ['error', {
      'max': 1
    }],

    'function-paren-newline': ['error', 'never'],
    allowAllPropertiesOnSameLine: 0,
    'space-before-function-paren': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'keyword-spacing': 'error',
    'space-before-blocks': 'error',
    '@typescript-eslint/no-explicit-any': 0
  }
}, globalIgnores(['**/*.d.ts', '**/*.js', '**/*.cjs' ])]);