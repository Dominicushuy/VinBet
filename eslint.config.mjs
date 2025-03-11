// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  { ignores: ['dist', '.next', 'node_modules'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    settings: {
      react: { version: 'detect' },
      next: { rootDir: '.' }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin
    },
    rules: {
      // Base JS and React rules
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn',
      '@next/next/no-sync-scripts': 'warn',

      // Customized React rules (from your example)
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off',

      // Common code quality rules
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  // Special rules for Next.js pages and app directories
  {
    files: ['pages/**/*.{js,jsx}', 'app/**/*.{js,jsx}'],
    rules: {
      '@next/next/no-title-in-document-head': 'warn',
      '@next/next/no-document-import-in-page': 'error'
    }
  }
]
