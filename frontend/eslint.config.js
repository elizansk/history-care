import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import html from 'eslint-plugin-html'
import unicorn from 'eslint-plugin-unicorn'

import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'src-tauri/target',
    'src/api/generated',
  ]),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      unicorn,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",

      "unicorn/filename-case": [
         "error",
         {
           cases: {
             camelCase: true,
             kebabCase: true,
             pascalCase: true
           }
         }
       ]
    }
  },

  {
    files: ['**/*.html'],
    plugins: {
      html,
    },
  },
])
