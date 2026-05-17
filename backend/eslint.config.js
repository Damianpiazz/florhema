import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.husky/**',
      'generated/**',
      '*.config.js'
    ]
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node
      },

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },

    plugins: {
      import: importPlugin
    },

    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },

    rules: {
      /**
       * TYPESCRIPT
       */
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports'
        }
      ],

      '@typescript-eslint/no-misused-promises': 'error',

      '@typescript-eslint/no-floating-promises': 'error',

      /**
       * IMPORTS
       */
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],

          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          },

          'newlines-between': 'always'
        }
      ],

      'import/no-duplicates': 'error',

      /**
       * GENERAL
       */
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error']
        }
      ],

      eqeqeq: ['error', 'always'],

      curly: ['error', 'all']
    }
  },

  prettier
]